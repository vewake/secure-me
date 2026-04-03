import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  ActivityIndicator
} from "react-native";
import ApiConstants from "@/constants/apiConstants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';

export default function NearbyHelp() {
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch nearby users
  const getNearbyUsers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const response = await axios.get(ApiConstants.NEARBY_USERS, {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      });

      // Combine user info with location data
      if (response.data && response.data.nearbyUserInfo && response.data.nearbyUsers) {
        const combinedData = response.data.nearbyUsers.map(locationData => {
          const userInfo = response.data.nearbyUserInfo.find(user => user.id === locationData.userId);
          return {
            ...locationData,
            ...userInfo
          };
        });

        setNearbyUsers(combinedData);
      } else {
        setError("Invalid data format received");
      }
    } catch (err) {
      setError("Failed to fetch nearby users: " + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Call for help function
  const callForHelp = (user) => {
    Alert.alert(
      "Call for Help",
      `Are you sure you want to call ${user.name} for help?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Call",
          onPress: () => {
            // Make phone call
            Linking.openURL(`tel:${user.phone}`);
          }
        }
      ]
    );
  };

  // Send SOS message
  const sendSOSMessage = async (user: any) => {
    let alert: any = await AsyncStorage.getItem("alert");
    let storedLink = JSON.parse(alert).accessCode;
    storedLink = ApiConstants.WEBSITE_URL + storedLink;

    Alert.alert(
      "Send SOS",
      `Send an SOS message to ${user.name}?`,
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Send",
          onPress: () => {
            // Send SMS with location information
            const message = `SOS! I need help! My current location: ${storedLink}  `;
            Linking.openURL(`sms:${user.phone}?body=${encodeURIComponent(message)}`);
          }
        }
      ]
    );
  };

  // Calculate distance between two coordinates (haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(2);
  };

  const deg2rad = (deg) => {
    return deg * (Math.PI / 180);
  };

  // Refresh the data when component mounts
  useEffect(() => {
    getNearbyUsers();
  }, []);

  // Render individual user card
  const renderUserCard = ({ item }) => {
    // Get user's current location from the most recent data
    // In a real app, you would get this from device location
    const userLocation = nearbyUsers.find(u => u.userId === 1); // Assuming userId 1 is the current user
    const distance = userLocation ?
      calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        item.latitude,
        item.longitude
      ) : "Unknown";

    return (
      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.details}>Distance: {distance} km</Text>
          <Text style={styles.details}>Phone: {item.phone}</Text>
          <Text style={styles.details}>Gender: {item.gender}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.callButton]}
            onPress={() => callForHelp(item)}
          >
            <Ionicons name="call" size={20} color="white" />
            <Text style={styles.buttonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.sosButton]}
            onPress={() => sendSOSMessage(item)}
          >
            <Ionicons name="warning" size={20} color="white" />
            <Text style={styles.buttonText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Helpers</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={getNearbyUsers}
        >
          <Ionicons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={getNearbyUsers}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : nearbyUsers.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people" size={50} color="#999" />
          <Text style={styles.emptyText}>No nearby users found</Text>
        </View>
      ) : (
        <FlatList
          data={nearbyUsers.filter(user => user.userId !== 1)} // Filter out current user
          keyExtractor={(item) => item.userId.toString()}
          renderItem={renderUserCard}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  refreshButton: {
    padding: 8,
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userInfo: {
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  details: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  callButton: {
    backgroundColor: "#007AFF",
  },
  sosButton: {
    backgroundColor: "#FF3B30",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 6,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    marginTop: 8,
  },
});
