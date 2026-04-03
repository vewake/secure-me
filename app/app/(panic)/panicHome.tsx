import React, { useState, useEffect, useRef } from 'react';
import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View, TouchableOpacity, Image, Alert, ScrollView, Platform } from 'react-native';
import { Camera, CameraView } from 'expo-camera';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import * as Location from 'expo-location';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import { Button } from 'react-native';
import ApiConstants from '@/constants/apiConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function PanicHome() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState(null);
  const [captureInterval, setCaptureInterval] = useState(3000); // 3 seconds by default
  const [audioInterval, setAudioInterval] = useState(10000); // 10 seconds by default
  const [isCapturing, setIsCapturing] = useState(false);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [lastCapturedImage, setLastCapturedImage] = useState(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const [audioCount, setAudioCount] = useState(0);
  const [captureLog, setCaptureLog] = useState([]);
  const [location, setLocation] = useState(null);
  const [locationCount, setLocationCount] = useState(0);

  const cameraRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const audioIntervalRef = useRef(null);
  const locationIntervalRef = useRef(null);
  const recording = useRef(null);
  const audioTimeoutRef = useRef(null);
  const [facing, setFacing] = useState("back");

  // Request camera, media library, audio, and location permissions on component mount
  useEffect(() => {
    (async () => {
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

      setHasPermission(
        cameraStatus === 'granted' &&
        mediaStatus === 'granted' &&
        audioStatus === 'granted' &&
        locationStatus === 'granted'
      );
    })();

    startCapturing();
    // Cleanup on unmount
    return () => {
      if (captureIntervalRef.current) {
        clearInterval(captureIntervalRef.current);
      }
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current);
      }
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
      stopRecording();
    };
  }, []);

  const startCapturing = () => {
    if (isCapturing) return;
    setIsCapturing(true);

    // Add log entry for starting capture
    addLogEntry(`Started capturing every ${captureInterval / 1000} seconds`);

    // Start photo capture interval
    captureIntervalRef.current = setInterval(captureAndSend, captureInterval);

    // Start audio recording interval
    audioIntervalRef.current = setInterval(startNewAudioRecording, audioInterval);

    // Start location tracking
    startLocationTracking();

    // Start first audio recording immediately
    startNewAudioRecording();
  };

  const stopCapturing = () => {
    if (!isCapturing) return;
    setIsCapturing(false);

    // Add log entry for stopping capture
    addLogEntry('Stopped capturing');

    // Clear photo interval
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
    }

    // Clear audio interval and stop any ongoing recording
    if (audioIntervalRef.current) {
      clearInterval(audioIntervalRef.current);
      audioIntervalRef.current = null;
    }

    // Clear location interval
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }

    stopRecording();
  };

  const addLogEntry = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setCaptureLog(prevLog => [`[${timestamp}] ${message}`, ...prevLog.slice(0, 19)]);

    // Also store log in AsyncStorage for access in the LogsScreen
    AsyncStorage.getItem('captureLogs').then(storedLogs => {
      const logs = storedLogs ? JSON.parse(storedLogs) : [];
      logs.unshift(`[${timestamp}] ${message}`);
      // Keep only the last 100 logs
      AsyncStorage.setItem('captureLogs', JSON.stringify(logs.slice(0, 100)));
    });

  };

  // Start location tracking
  const startLocationTracking = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        addLogEntry('Location permission denied');
        return;
      }

      // Get initial location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(currentLocation);
      addLogEntry(`Initial location acquired: ${currentLocation.coords.latitude.toFixed(6)}, ${currentLocation.coords.longitude.toFixed(6)}`);

      // Send initial location to backend
      await sendLocationToBackend(currentLocation);

      // Start location tracking interval (every 5 second)
      locationIntervalRef.current = setInterval(trackAndSendLocation, 5000);
    } catch (error) {
      addLogEntry(`Error starting location tracking: ${error.message}`);
      console.error('Failed to start location tracking', error);
    }
  };

  // Track and send location
  const trackAndSendLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setLocation(currentLocation);
      setLocationCount(prev => prev + 1);
      await sendLocationToBackend(currentLocation);
    } catch (error) {
      addLogEntry(`Error tracking location: ${error.message}`);
      console.error('Failed to track location', error);
    }
  };

  // Send location to backend
  const sendLocationToBackend = async (locationData) => {

    const token = await AsyncStorage.getItem('token');
    let data = await AsyncStorage.getItem("alert");
    let alertId = JSON.parse(data);

    try {
      const response = await axios.post(
        ApiConstants.SEND_LOCATION, // Assuming SEND_LOCATION endpoint exists
        {
          latitude: locationData.coords.latitude,
          longitude: locationData.coords.longitude,
          accuracy: locationData.coords.accuracy,
          altitude: locationData.coords.altitude,
          speed: locationData.coords.speed,
          heading: locationData.coords.heading,
          timestamp: locationData.timestamp,
          alertid: alertId.id,
          deviceId: Constants.installationId,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.status == 200) {
        if (locationCount % 10 === 0) { // Log only every 10th update to avoid spam
          addLogEntry(`Location update #${locationCount} sent to backend`);
        }
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error) {
      addLogEntry(`Failed to send location: ${error.message}`);
      console.error('Error sending location to backend:', error);
    }
  };

  const startNewAudioRecording = async () => {
    try {
      // Stop any previous recording
      await stopRecording();

      // Configure audio
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Start new recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recording.current = newRecording;
      setIsRecordingAudio(true);
      addLogEntry(`Started audio recording #${audioCount + 1}`);

      // Set timeout to stop this recording (5 seconds or half the interval, whichever is less)
      const recordingDuration = Math.max(5000, audioInterval / 2);
      audioTimeoutRef.current = setTimeout(() => {
        finishRecording();
      }, recordingDuration);

    } catch (error) {
      addLogEntry(`Audio recording error: ${error.message}`);
      console.error('Failed to start recording', error);
    }
  };

  // Fixed toggleCameraFacing function to handle state correctly
  const toggleCameraFacing = () => {
    const newFacing = facing === "back" ? "front" : "back";
    setFacing(newFacing);
    addLogEntry(`Camera switched to ${newFacing} facing`);
  };

  const stopRecording = async () => {
    if (recording.current) {
      try {
        await recording.current.stopAndUnloadAsync();
        setIsRecordingAudio(false);
        if (audioTimeoutRef.current) {
          clearTimeout(audioTimeoutRef.current);
          audioTimeoutRef.current = null;
        }
      } catch (error) {
        console.error('Failed to stop recording', error);
      }
      recording.current = null;
    }
  };

  const finishRecording = async () => {
    try {
      if (!recording.current) return;

      // Stop the recording
      await recording.current.stopAndUnloadAsync();
      setIsRecordingAudio(false);
      clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = null;

      // Get the recording URI
      const uri = recording.current.getURI();
      recording.current = null;

      // Save to device
      const asset = await MediaLibrary.createAssetAsync(uri);

      // Get the file info and read as base64
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });

      // Log success
      setAudioCount(prev => prev + 1);
      addLogEntry(`Completed audio recording #${audioCount + 1}, size: ${(fileInfo.size / 1024).toFixed(1)}KB`);

      // Send to backend
      await sendAudioToBackend(base64Audio);

    } catch (error) {
      addLogEntry(`Error finishing audio: ${error.message}`);
      console.error('Error finishing recording:', error);
    }
  };

  const captureAndSend = async () => {
    if (!cameraRef.current) return;

    try {
      // Capture the photo
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7,
        base64: true,
        silent: true
      });

      // Update the displayed image
      setLastCapturedImage(photo.uri);
      setCapturedCount(prev => prev + 1);

      // Save to device
      const asset = await MediaLibrary.createAssetAsync(photo.uri);

      // Log success
      addLogEntry(`Captured image #${capturedCount + 1}, saved to device`);

      // Send to backend
      await sendToBackend(photo.base64);

    } catch (error) {
      addLogEntry(`Error: ${error.message}`);
      console.error('Error capturing image:', error);
    }
  };

  const sendToBackend = async (base64Data: any) => {
    const token = await AsyncStorage.getItem('token');
    let data: any = await AsyncStorage.getItem("alert");

    let alertId = JSON.parse(data);
    try {
      const response = await axios.post(
        ApiConstants.SEND_IMAGE,
        {
          type: 'image',
          image: base64Data,
          alertid: alertId.id,
          timestamp: new Date().toISOString(),
          deviceId: Constants.installationId,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );


      if (response.status == 200) {
        addLogEntry('Image sent to backend successfully');
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error: any) {
      addLogEntry(`Failed to send image: ${error.message}`);
      console.error('Error sending image to backend:', error);
    }
  };

  const sendAudioToBackend = async (base64Data: any) => {
    const token = await AsyncStorage.getItem('token');
    let data: any = await AsyncStorage.getItem("alert");

    let alertId = JSON.parse(data);
    try {
      const response = await axios.post(
        ApiConstants.SEND_AUDIO,
        {
          type: 'audio',
          audio: base64Data,
          alertid: alertId.id,
          timestamp: new Date().toISOString(),
          deviceId: Constants.installationId,
        },
        {
          headers: {
            Authorization: token,
            'Content-Type': 'application/json',
          },
        }
      );


      if (response.status == 200) {
        addLogEntry('Audio sent to backend successfully');
      } else {
        throw new Error(`Server responded with ${response.status}`);
      }
    } catch (error: any) {
      addLogEntry(`Failed to send audio: ${error.message}`);
      console.error('Error sending audio to backend:', error);
    }
  };

  // Fixed updateCaptureInterval function to always restart capturing
  const updateCaptureInterval = (seconds: any) => {
    const milliseconds = seconds * 1000;
    setCaptureInterval(milliseconds);

    // Always restart capturing regardless of current state
    if (isCapturing) {
      stopCapturing();
      setTimeout(() => {
        startCapturing();
      }, 100);
    } else {
      startCapturing();
    }

    addLogEntry(`Set photo capture interval to ${seconds} seconds`);
  };

  const updateAudioInterval = (seconds: any) => {
    const milliseconds = seconds * 1000;
    setAudioInterval(milliseconds);
    if (isCapturing) {
      stopCapturing();
      setTimeout(() => {
        startCapturing();
      }, 100);
    } else {
      startCapturing();
    }

    addLogEntry(`Set audio interval to ${seconds} seconds`);
  };

  if (hasPermission === false) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ marginBottom: 20 }}>Camera, media library, audio, and location permissions are required</Text>
        <Button
          title="Request Permissions"
          onPress={async () => {
            const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
            const { status: mediaStatus } = await MediaLibrary.requestPermissionsAsync();
            const { status: audioStatus } = await Audio.requestPermissionsAsync();
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            setHasPermission(
              cameraStatus === 'granted' &&
              mediaStatus === 'granted' &&
              audioStatus === 'granted' &&
              locationStatus === 'granted'
            );
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={facing}
          ref={cameraRef}
        />
      </View>

      <View style={styles.controlPanel}>
        <View style={styles.previewContainer}>
          {lastCapturedImage ? (
            <Image
              source={{ uri: lastCapturedImage }}
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.noPreview}>
              <Text style={styles.noPreviewText}>No image captured yet</Text>
            </View>
          )}
        </View>
        <View style={styles.statsContainer}>
          {/* Flip camera button with improved styling */}
          <TouchableOpacity
            style={styles.flipButton}
            onPress={toggleCameraFacing}
          >
            <Text style={styles.flipButtonText}>
              Flip Camera ({facing === "back" ? "Back" : "Front"})
            </Text>
          </TouchableOpacity>

          <Text style={styles.statsText}>
            Photos: {captureInterval / 1000}s | Audio: {audioInterval / 1000}s
          </Text>
          <Text style={styles.statsText}>
            Images: {capturedCount} | Audio clips: {audioCount} | Location updates: {locationCount}
          </Text>

          {/* Location display */}
          {location && (
            <Text style={styles.locationText}>
              Location: {location.coords.latitude.toFixed(6)}, {location.coords.longitude.toFixed(6)}
            </Text>
          )}

          {isRecordingAudio && (
            <View style={styles.recordingIndicator}>
              <Text style={styles.recordingText}>● RECORDING</Text>
            </View>
          )}
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[styles.button, isCapturing ? styles.stopButton : styles.startButton]}
            onPress={isCapturing ? stopCapturing : startCapturing}
          >
            <Text style={styles.buttonText}>
              {isCapturing ? 'STOP recording' : 'START recording'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              stopRecording();
              router.push('/');
            }}
            style={[styles.button, styles.stopButton]}
          >
            <Text style={styles.buttonText}>
              STOP SOS
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
              justifyContent: 'center',
              marginHorizontal: 4,
              backgroundColor: '#460f10',
            }}
            onPress={() => {
              captureAndSend();
              startNewAudioRecording();
            }}
          >
            <Text style={styles.buttonText}>Manual Capture</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.intervalButtons}>
          <Text style={styles.intervalLabel}>Photo Interval:</Text>
          {[1, 3, 5, 10, 15].map(seconds => (
            <TouchableOpacity
              key={`photo-${seconds}`}
              style={[
                styles.intervalButton,
                captureInterval === seconds * 1000 ? styles.selectedInterval : null
              ]}
              onPress={() => updateCaptureInterval(seconds)}
            >
              <Text style={styles.intervalButtonText}>{seconds}s</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.intervalButtons}>
          <Text style={styles.intervalLabel}>Audio Interval:</Text>
          {[10, 15, 20, 30].map(seconds => (
            <TouchableOpacity
              key={`audio-${seconds}`}
              style={[
                styles.intervalButton,
                audioInterval === seconds * 1000 ? styles.selectedInterval : null
              ]}
              onPress={() => updateAudioInterval(seconds)}
            >
              <Text style={styles.intervalButtonText}>{seconds}s</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Limited preview of logs - full view will be in separate screen */}
      <View style={styles.previewLogContainer}>
        <Text style={styles.logTitle}>Recent Activity</Text>
        <Text style={styles.viewAllText}>See full logs in Logs tab</Text>
        <ScrollView style={styles.logScroll}>
          {captureLog.slice(0, 5).map((entry, index) => (
            <Text key={index} style={styles.logEntry}>{entry}</Text>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "transparent",
    margin: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  cameraContainer: {
    height: '35%',
    width: '100%',
    marginTop: Constants.statusBarHeight,
  },
  camera: {
    flex: 1,
  },
  controlPanel: {
    padding: 16,
    backgroundColor: '#fff',
  },
  previewContainer: {
    height: 120,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  noPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPreviewText: {
    color: '#666',
  },
  statsContainer: {
    marginBottom: 16,
    flexDirection: 'column',
  },
  statsText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#2196F3',
    marginBottom: 4,
  },
  recordingIndicator: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 4,
    borderRadius: 4,
    marginTop: 4,
  },
  recordingText: {
    color: 'red',
    fontWeight: 'bold',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  startButton: {
    backgroundColor: '#4CAF50',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  intervalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  intervalLabel: {
    marginRight: 8,
    width: 100,
  },
  intervalButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedInterval: {
    backgroundColor: '#2196F3',
  },
  intervalButtonText: {
    color: '#000',
  },
  previewLogContainer: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    maxHeight: 150,
  },
  logTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  viewAllText: {
    fontSize: 12,
    color: '#2196F3',
    marginBottom: 8,
  },
  logScroll: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 8,
    maxHeight: 100,
  },
  logEntry: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  // Improved flip button styles
  flipButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  flipButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
