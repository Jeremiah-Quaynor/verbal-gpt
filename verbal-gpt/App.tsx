import { useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import { fetchAudio } from "./utils/fetchAudio";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";

Audio.setAudioModeAsync({
  allowsRecordingIOS: false,
  staysActiveInBackground: false,
  playsInSilentModeIOS: true,
  shouldDuckAndroid: true,
  playThroughEarpieceAndroid: false,
});

export default function App() {
  const [borderColor, setBorderColor] = useState<"lightgray" | "lightgreen">(
    "lightgray"
  );

  const { state, startRecognizing, stopRecognizing, destroyRecognizing } =
    useVoiceRecognition();

  const handleSubmit = async () => {
    if (!state.results[0]) return;
    try {
      const audioBlob = await fetchAudio(state.results[0]);

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target && e.target.result === "string") {
          const audioData = e.target.result.split(",")[1];
        }
      };
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      <Text
        style={{
          fontSize: 32,
          fontWeight: "bold",
          marginBottom: 16,
        }}
      >
        Verbal GPT
      </Text>
      <Text
        style={{
          textAlign: "center",
          marginBottom: 5,
          color: "#333333",
          fontSize: 12,
        }}
      >
        Press and hold this button to record your voice. Release the button to
        send the record and you will hear a response.
      </Text>
      <Text
        style={{
          marginVertical: 10,
          fontSize: 17,
        }}
      >
        Your message:
      </Text>
      <Pressable
        style={{
          width: "90%",
          padding: 30,
          gap: 10,
          borderWidth: 3,
          alignItems: "center",
          borderColor: borderColor,
        }}
        onPressIn={() => {
          setBorderColor("lightgreen");
          startRecognizing();
        }}
        onPressOut={() => {
          setBorderColor("lightgray");
          stopRecognizing();
        }}
      >
        <Text>Hold to Speak</Text>
      </Pressable>
      <Button title="Replay last message" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});
