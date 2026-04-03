import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { Camera } from "expo-camera";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from "expo-av";
import axios from "axios";

export function Status() {
  const [locationPermission, setLocationPermission] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(false);
  const [audioPermission, setAudioPermission] = useState(false);
  const [isLocationSharing, setIsLocationSharing] = useState(false);
  const [isVideoRecording, setIsVideoRecording] = useState(false);
  const [isAudioRecording, setIsAudioRecording] = useState(false);
  const [stealthMode, setStealthMode] = useState(false);
  const requestPermissions = async () => {
    try {
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

      if (locationStatus === "granted") {
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        setLocationPermission(locationStatus === "granted" && backgroundStatus.status === "granted");
      } else {
        setLocationPermission(false);
      }
      const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraStatus === "granted");

      const { status: audioStatus } = await Audio.requestPermissionsAsync();
      setAudioPermission(audioStatus === "granted");
    } catch (error) {
      console.error("Permission request error:", error);
      Alert.alert("Permission Error", "Could not obtain required permissions");
    }
  };

  // Toggle Location Sharing
  const toggleLocationSharing = async () => {
    try {
      if (!locationPermission) {
        await requestPermissions();
        return;
      }

      const newStatus = !isLocationSharing;
      setIsLocationSharing(newStatus);

      if (newStatus) {
        const location = await Location.getCurrentPositionAsync({});
        // Uncomment this when your backend is ready
        // await sendLocationToBackend(location.coords);
      }
    } catch (error) {
      console.error("Location sharing error:", error);
      Alert.alert("Location Error", "Could not toggle location sharing");
      setIsLocationSharing(false);
    }
  };

  // Toggle Video Recording
  const toggleVideoRecording = async () => {
    try {
      if (!cameraPermission) {
        await requestPermissions();
        return;
      }

      setIsVideoRecording(prev => !prev);
    } catch (error) {
      console.error("Video recording error:", error);
      Alert.alert("Video Error", "Could not toggle video recording");
      setIsVideoRecording(false);
    }
  };

  // Toggle Audio Recording
  const toggleAudioRecording = async () => {
    try {
      if (!audioPermission) {
        await requestPermissions();
        return;
      }

      setIsAudioRecording(prev => !prev);
    } catch (error) {
      console.error("Audio recording error:", error);
      Alert.alert("Audio Error", "Could not toggle audio recording");
      setIsAudioRecording(false);
    }
  };

  // Toggle Stealth Mode
  const toggleStealthMode = () => {
    try {
      setStealthMode(prev => !prev);
    } catch (error) {
      console.error("Stealth mode error:", error);
      Alert.alert("Stealth Mode Error", "Could not toggle stealth mode");
      setStealthMode(false);
    }
  };

  // Initialize permissions on component mount
  useEffect(() => {
    async function LoadusersosChoices() {
      await requestPermissions();

      let data: any = await AsyncStorage.getItem('sosChoices');
      if (data !== null) {
        data = JSON.parse(data);
        setIsLocationSharing(data.isLocationSharing);
        setIsAudioRecording(data.isAudioRecording);
        setIsVideoRecording(data.isVideoRecording);
        setStealthMode(data.stealthMode);
      }
    }
    LoadusersosChoices();
  }, []);




  useEffect(() => {
    async function SaveusersosChoices() {
      await AsyncStorage.setItem('sosChoices', JSON.stringify({
        isLocationSharing,
        isAudioRecording,
        isVideoRecording,
        stealthMode
      }));
    }
    SaveusersosChoices();
  }, [isLocationSharing, isVideoRecording, isAudioRecording, stealthMode]);




  return (
    <View style={styles.statusSection}>
      <TouchableOpacity
        style={[styles.statusCard, isLocationSharing && styles.activeCard]}
        onPress={toggleLocationSharing}
      >
        <Ionicons
          name="location-outline"
          size={24}
          color={isLocationSharing ? "#007AFF" : "#333333"}
        />
        <Text style={styles.statusText}>
          Location: {isLocationSharing ? "Active" : "Inactive"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.statusCard, isVideoRecording && styles.activeCard]}
        onPress={toggleVideoRecording}
      >
        <Ionicons
          name="videocam-outline"
          size={24}
          color={isVideoRecording ? "#007AFF" : "#333333"}
        />
        <Text style={styles.statusText}>
          Video: {isVideoRecording ? "Recording" : "Stopped"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.statusCard, isAudioRecording && styles.activeCard]}
        onPress={toggleAudioRecording}
      >
        <Ionicons
          name="mic-outline"
          size={24}
          color={isAudioRecording ? "#007AFF" : "#333333"}
        />
        <Text style={styles.statusText}>
          Audio: {isAudioRecording ? "Recording" : "Stopped"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.statusCard, stealthMode && styles.activeCard]}
        onPress={toggleStealthMode}
      >
        <Ionicons
          name="volume-mute-outline"
          size={24}
          color={stealthMode ? "#007AFF" : "#333333"}
        />
        <Text style={styles.statusText}>
          Stealth: {stealthMode ? "On" : "Off"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  statusSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    padding: 10,
  },
  statusCard: {
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 12,
    width: "45%",
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  activeCard: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#333333",
  },
});



