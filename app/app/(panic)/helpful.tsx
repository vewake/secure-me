import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Animated } from "react-native";
import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";

export default function SOSScreen() {
  const [sirenSound, setSirenSound] = useState(null);
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const flashingRef = useRef(false);
  const [backgroundColor, setBackgroundColor] = useState("#1a1a1a");
  const animatedBackground = useRef(new Animated.Value(0)).current;

  // Clean up sound resources when component unmounts
  useEffect(() => {
    return () => {
      if (sirenSound) {
        sirenSound.unloadAsync();
      }
      stopFlashing();
    };
  }, [sirenSound]);

  // Function to make an emergency call
  const makeCall = (number) => {
    Linking.openURL(`tel:${number}`).catch(() => Alert.alert("Error", "Cannot make call"));
  };

  // Function to toggle siren sound
  const toggleSiren = async () => {
    if (isSirenPlaying) {
      // Stop the siren
      if (sirenSound) {
        await sirenSound.stopAsync();
        await sirenSound.unloadAsync();
        setSirenSound(null);
      }
      setIsSirenPlaying(false);
    } else {
      // Play the siren
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/police.mp3"),
          { shouldPlay: true, isLooping: true }
        );
        setSirenSound(sound);
        setIsSirenPlaying(true);
      } catch (error) {
        Alert.alert("Error", "Failed to play siren sound");
        console.error(error);
      }
    }
  };

  // Function to flash the screen black and white in SOS pattern
  const flashSOS = () => {
    // Prevent multiple executions
    if (isFlashing) return;

    setIsFlashing(true);
    flashingRef.current = true;

    // SOS in Morse code: ... --- ...
    const shortDuration = 300; // Duration for dots
    const longDuration = 900;  // Duration for dashes
    const pauseShort = 300;    // Pause between elements
    const pauseLong = 900;     // Pause between letters

    const flashSequence = async () => {
      if (!flashingRef.current) return;

      // S: three short flashes
      for (let i = 0; i < 3; i++) {
        if (!flashingRef.current) return;
        setBackgroundColor("#ffffff"); // White flash
        await new Promise(resolve => setTimeout(resolve, shortDuration));
        setBackgroundColor("#1a1a1a"); // Back to black
        if (i < 2 && flashingRef.current) await new Promise(resolve => setTimeout(resolve, pauseShort));
      }

      // Pause between letters
      if (!flashingRef.current) return;
      await new Promise(resolve => setTimeout(resolve, pauseLong));

      // O: three long flashes
      for (let i = 0; i < 3; i++) {
        if (!flashingRef.current) return;
        setBackgroundColor("#ffffff"); // White flash
        await new Promise(resolve => setTimeout(resolve, longDuration));
        setBackgroundColor("#1a1a1a"); // Back to black
        if (i < 2 && flashingRef.current) await new Promise(resolve => setTimeout(resolve, pauseShort));
      }

      // Pause between letters
      if (!flashingRef.current) return;
      await new Promise(resolve => setTimeout(resolve, pauseLong));

      // S: three short flashes again
      for (let i = 0; i < 3; i++) {
        if (!flashingRef.current) return;
        setBackgroundColor("#ffffff"); // White flash
        await new Promise(resolve => setTimeout(resolve, shortDuration));
        setBackgroundColor("#1a1a1a"); // Back to black
        if (i < 2 && flashingRef.current) await new Promise(resolve => setTimeout(resolve, pauseShort));
      }

      // Wait and repeat if still flashing
      if (flashingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (flashingRef.current) {
          flashSequence();
        }
      }
    };

    flashSequence().catch(error => {
      console.error("Error during flashing sequence:", error);
      stopFlashing();
    });
  };

  // Function to stop screen flashing
  const stopFlashing = () => {
    flashingRef.current = false;
    setIsFlashing(false);
    setBackgroundColor("#1a1a1a"); // Reset to default background
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <StatusBar style="light" />
      <Text style={styles.title}>SOS Emergency</Text>

      {/* Call Buttons */}
      <TouchableOpacity style={styles.button} onPress={() => makeCall("100")}>
        <Text style={styles.buttonText}>Call Police (100)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => makeCall("102")}>
        <Text style={styles.buttonText}>Call Ambulance (102)</Text>
      </TouchableOpacity>

      {/* Toggle Siren Button */}
      <TouchableOpacity
        style={[
          styles.button,
          isSirenPlaying ? styles.stopButton : styles.sirenButton
        ]}
        onPress={toggleSiren}
      >
        <Text style={styles.buttonText}>
          {isSirenPlaying ? "Stop Siren" : "Play Siren"}
        </Text>
      </TouchableOpacity>

      {/* Screen Flash SOS Button */}
      <TouchableOpacity
        style={[
          styles.button,
          isFlashing ? styles.stopButton : styles.flashButton
        ]}
        onPress={isFlashing ? stopFlashing : flashSOS}
      >
        <Text style={styles.buttonText}>
          {isFlashing ? "Stop SOS Signal" : "Flash SOS Signal"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 30,
  },
  button: {
    width: "80%",
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#e63946",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  sirenButton: { backgroundColor: "#ffba08" },
  stopButton: { backgroundColor: "#6a040f" },
  flashButton: { backgroundColor: "#457b9d" },
})
