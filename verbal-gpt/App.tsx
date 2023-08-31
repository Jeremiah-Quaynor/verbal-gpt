import { useState } from "react";
import { Button, Pressable, StyleSheet, Text, View } from "react-native";
import { useVoiceRecognition } from "./hooks/useVoiceRecognition";
import { fetchAudio } from "./utils/fetchAudio";
import * as FileSystem from "expo-file-system";
import { Audio } from "expo-av";
import { writeAudioToFile } from "./utils/writeAudioToFile";
import { playFromPath } from "./utils/playFromPath";

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
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [path, setPath] = useState<string>("");

  const { state, startRecognizing, stopRecognizing, destroyRecognizing } =
    useVoiceRecognition();

    const listFiles = async () => {
      try {
        const result = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory!)
        if(result.length > 0) {
          const filename = result[0]
          const pathe = FileSystem.documentDirectory + filename
          setPath(pathe)
        }
      } catch (error) {
        console.log(error)
      }
    }

  const handleSubmit = async () => {
    if (!state.results[0]) return;
    try {
      const audioBlob = await fetchAudio(state.results[0]);

      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target && e.target.result === "string") {
          const audioData = e.target.result.split(",")[1];

          // save audio to file
          const pat = await writeAudioToFile(audioData);
          setPath(pat);

          // play audio
          await playFromPath(pat);
          destroyRecognizing();
        }
      };
      reader.readAsDataURL(audioBlob);
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
        Your message: {JSON.stringify(state, null, 2)}
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
          handleSubmit();
        }}
      >
        <Text>Hold to Speak</Text>
      </Pressable>
      <Button
        title="Replay last message"
        onPress={async() => {
          await playFromPath(path);
        }}
      />
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
