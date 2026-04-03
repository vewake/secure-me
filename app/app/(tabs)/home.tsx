import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Status } from '@/components/status';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as Location from 'expo-location';
import ApiConstants from '@/constants/apiConstants';

export default function Home() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const locationInterval = useRef(null);
  const router = useRouter();

  useEffect(() => {
    // Check for any active panic alerts when component mounts
    checkForActivePanicAlerts();

    // Request location permissions immediately
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert('Location Permission Required',
          'This app needs location access to send alerts during emergencies.');
        return;
      }
    })();
    startLocationTracking();
    // Clean up interval when component unmounts
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current);
      }
    };
  }, []);

  // Check if there's an active panic alert stored in AsyncStorage
  const checkForActivePanicAlerts = async () => {
    try {
      const activeAlert = await AsyncStorage.getItem('alert');
      if (activeAlert) {
        const alertData = JSON.parse(activeAlert);
        // Check if the alert is active based on your alert object structure
        if (alertData && alertData.active) {
          // Resume tracking if there's an active alert
          startLocationTracking();
        }
      }
    } catch (error) {
      console.error("Error checking for active alerts:", error);
    }
  };

  // Start tracking and sending location data
  const startLocationTracking = async () => {
    if (isTracking) return; // Prevent multiple intervals

    try {
      // Get initial location
      let currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(currentLocation);

      // Send initial location
      sendLocationToBackend(currentLocation);

      // Set up interval to update location every 3 seconds
      setIsTracking(true);
      locationInterval.current = setInterval(async () => {
        try {
          let newLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          setLocation(newLocation);
          sendLocationToBackend(newLocation);
        } catch (err) {
          console.error("Error getting location:", err);
        }
      }, 5000);
    } catch (error) {
      console.error("Error starting location tracking:", error);
      setErrorMsg('Failed to get location: ' + error.message);
    }
  };

  // Stop tracking location
  const stopLocationTracking = () => {
    if (locationInterval.current) {
      clearInterval(locationInterval.current);
      locationInterval.current = null;
      setIsTracking(false);
    }
  };

  // Send location data to backend
  const sendLocationToBackend = async (locationData) => {

    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        console.error("No authentication token found");
        return;
      }

      const locationPayload = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
        accuracy: locationData.coords.accuracy,
        timestamp: locationData.timestamp
      };

      const response = await axios.post(
        ApiConstants.SEND_PUSH_LOCATION,
        locationPayload,
        {
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        }
      );

    } catch (error) {
      console.error("Error sending location to backend:",
        error.response?.data || error.message);
    }
  };

  const handlePanicAlert = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await axios.get(ApiConstants.NEW_ALERT, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });
      await AsyncStorage.setItem('alert', JSON.stringify(response.data.alert));
    } catch (error) {
      console.error("Error fetching alert:", error.response?.data || error.message);
    }
    router.push('/shareLinkPage');
  };

  // Add a function to cancel panic alert
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>SecureMe</Text>
      </View>

      <View>
        <Status />
      </View>

      <TouchableOpacity
        style={styles.panicButton}
        onPress={handlePanicAlert}>
        <Text style={styles.panicButtonText}>Activate Panic Alert</Text>
      </TouchableOpacity>


      <View style={styles.navigation}>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  statusSection: {
    marginBottom: 40,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  statusText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  panicButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  panicButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#3498db',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  navButton: {
    backgroundColor: '#3498db',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trackingIndicator: {
    backgroundColor: '#27ae60',
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  trackingText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
