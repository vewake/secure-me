import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Sharing from "expo-sharing";
import * as SMS from "expo-sms";
import { useRouter } from "expo-router";
import ApiConstants from "@/constants/apiConstants";

let Clipboard;
try {
  Clipboard = require("expo-clipboard");
} catch (e) {
  console.warn("expo-clipboard not available, using fallback");
  // Simple fallback implementation if the module isn't available
  Clipboard = {
    setStringAsync: async (text: any) => {
      return Promise.resolve(true);
    }
  };
}

const SosScreen = () => {
  const router = useRouter()
  const [sosLink, setSosLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sosActive, setSosActive] = useState<boolean>(false);

  interface PhoneNumber {
    number: string;
    type: string;
  }

  interface Contact {
    id: string;
    name: string;
    phoneNumbers?: PhoneNumber[];
  }

  const [contacts, setContacts] = useState<Contact[]>([]);

  const loadSavedContacts = async () => {
    try {
      const savedContacts = await AsyncStorage.getItem('trustedContacts');
      if (savedContacts) {
        setContacts(JSON.parse(savedContacts));
      }
    } catch (error) {
      console.error('Error loading saved contacts:', error);
    }
  };

  useEffect(() => {
    fetchSosLink();
    loadSavedContacts();
  }, []);

  const fetchSosLink = async () => {
    setIsLoading(true);
    try {
      let alertdata: any = await AsyncStorage.getItem("alert");
      let storedLink = JSON.parse(alertdata).accessCode;
      storedLink = ApiConstants.WEBSITE_URL + storedLink;
      console.log(storedLink)
      if (storedLink) {
        setSosLink(storedLink);
      } else {
        setSosLink("no link");
      }
    } catch (error) {
      console.error("Error fetching SOS link:", error);
      Alert.alert("Error", "Failed to generate SOS link");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (!sosLink) {
      Alert.alert("Error", "No emergency code available to share.");
      return;
    }

    try {
      // Try to copy to clipboard
      try {
        await Clipboard.setStringAsync(sosLink);
        Alert.alert(
          "Copied to Clipboard",
          "Your emergency code has been copied to clipboard. You can now paste it into any messaging app."
        );
      } catch (clipboardError) {
        console.error("Clipboard error:", clipboardError);

        if (Platform.OS === 'ios' || Platform.OS === 'android') {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync("data:text/plain," + sosLink, {
              mimeType: 'text/plain',
              dialogTitle: 'Share Emergency Code'
            });
          } else {
            Alert.alert("Error", "Sharing is not available on this device");
          }
        } else {
          Alert.alert("Error", "Could not copy to clipboard or share");
        }
      }
    } catch (error) {
      console.error("Sharing error:", error);
      Alert.alert("Error", "Could not share emergency code");
    }
  };

  const sendSMSToContacts = async () => {
    try {
      await loadSavedContacts()
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable) {
        alert('SMS not available on this device');
        return;
      }

      const phoneNumbers = contacts
        .map(contact => contact.phoneNumbers?.[0]?.number)
        .filter(number => number) as string[];
      if (phoneNumbers.length === 0) {
        alert('No phone numbers available');
        return;
      }
      const { result } = await SMS.sendSMSAsync(
        phoneNumbers,
        `🚨 EMERGENCY! My SOS Link is: ${sosLink}`
      );
      // Handle SMS sending result
      if (result === 'sent') {
        alert('SMS Sent' + `Sent to ${phoneNumbers.length} contacts`);
      } else {
        alert('SMS Send Failed');
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Error' + 'Failed to send SMS');
    }
  };

  const startSOS = () => {
    setSosActive(true);

    // This would typically:
    // 1. Start location tracking
    // 2. Potentially notify emergency contacts
    // 3. Navigate to a detailed SOS dashboard

    // Alert.alert(
    //   "SOS Activated",
    //   "Emergency mode has been activated. You can now share your emergency code or send SMS.",
    //   [
    //     {
    //       text: "OK",
    //       onPress: () => {
    //         // Save SOS status
    //       }
    //
    //     }
    //   ]
    // );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Emergency SOS</Text>
      </View>
      <View style={styles.content}>
        {!sosActive ? (
          <View style={styles.startContainer}>
            <Text style={styles.startText}>
              In case of emergency, press the button below to activate SOS mode.
              This will allow you to share your location with trusted contacts.
            </Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={startSOS}
            >
              <Text style={styles.startButtonText}>ACTIVATE SOS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.codeContainer}>
              <Text style={styles.codeLabel}>Your Emergency Link:</Text>
              {isLoading ? (
                <Text style={styles.loadingText}>Generating code...</Text>
              ) : (
                <Text style={styles.codeText}>{sosLink || "No code available"}</Text>
              )}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Share this Link with emergency contacts so they can locate you.
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.shareButton]}
                onPress={handleShare}
                disabled={isLoading || !sosLink}
              >
                <Text style={styles.buttonText}>Copy to Clipboard</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.smsButton]}
                onPress={sendSMSToContacts}
                disabled={isLoading || !sosLink}
              >
                <Text style={styles.buttonText}>Send Emergency SMS</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#198754" }]}
                onPress={() => {
                  router.push('/(panic)/panicHome')

                }}
              >
                <Text style={styles.buttonText}>Go to SOS Dashboard</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa"
  },
  header: {
    backgroundColor: "#dc3545",
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: "center"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ffffff"
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center"
  },
  startContainer: {
    alignItems: "center",
    justifyContent: "center"
  },
  startText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
    color: "#495057",
    lineHeight: 24
  },
  startButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 50,
    alignItems: "center",
    width: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  startButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold"
  },
  codeContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  codeLabel: {
    fontSize: 16,
    color: "#6c757d",
    marginBottom: 8
  },
  codeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    textAlign: "center"
  },
  loadingText: {
    fontSize: 16,
    color: "#6c757d",
    fontStyle: "italic",
    textAlign: "center"
  },
  infoBox: {
    backgroundColor: "#e9ecef",
    borderRadius: 8,
    padding: 16,
    marginBottom: 30
  },
  infoText: {
    fontSize: 14,
    color: "#495057",
    textAlign: "center"
  },
  buttonContainer: {
    gap: 16
  },
  button: {
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center"
  },
  shareButton: {
    backgroundColor: "#0d6efd"
  },
  smsButton: {
    backgroundColor: "#dc3545"
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600"
  }
});

export default SosScreen;
