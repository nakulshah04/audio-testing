// App.js
import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import useAudioLevels from './sensors/expo_av';
import useAudioPlayback from './sensors/expo_playback';

export default function App() {
  const decibels = useAudioLevels();
  const {
    startRecording,
    stopRecording,
    playRecording,
    recording,
    playing,
    recordedURI,
    hasPermission,
  } = useAudioPlayback();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Audio Level: {decibels ? `${decibels.toFixed(2)} dB` : 'Measuring...'}
      </Text>
      <Button
        title={recording ? 'Stop Recording' : 'Start Recording'}
        onPress={recording ? stopRecording : startRecording}
        disabled={!hasPermission}
      />
      <Button
        title="Play Recording"
        onPress={playRecording}
        disabled={!recordedURI || recording || playing}
      />
      {!hasPermission && (
        <Text style={styles.error}>Microphone permission is required</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    marginBottom: 20,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});