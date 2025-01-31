// sensors/expo_playback.js
import { useState, useEffect } from 'react';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const audioRecorderPlayer = new AudioRecorderPlayer();

export default function useAudioPlayback() {
  const [recording, setRecording] = useState(false);
  const [recordedURI, setRecordedURI] = useState('');
  const [playing, setPlaying] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    try {
      const permission =
        Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;
      const result = await check(permission);
      if (result === RESULTS.DENIED) {
        const permissionResult = await request(permission);
        setHasPermission(permissionResult === RESULTS.GRANTED);
      } else {
        setHasPermission(result === RESULTS.GRANTED);
      }
    } catch (error) {
      console.error('Permission check failed:', error);
    }
  };

  const startRecording = async () => {
    if (!hasPermission) {
      console.error('No microphone permission');
      return;
    }

    const fileName = `audio_${Date.now()}.m4a`;
    const path = Platform.select({
      ios: `file://${RNFS.DocumentDirectoryPath}/${fileName}`,
      android: `${RNFS.DocumentDirectoryPath}/${fileName}`,
    }) || `${RNFS.DocumentDirectoryPath}/${fileName}`;

    setRecordedURI(path);

    try {
      await audioRecorderPlayer.startRecorder(path);
      setRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      console.log('Recording is not active');
      return;
    }

    try {
      await audioRecorderPlayer.stopRecorder();
      setRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setRecording(false);
    }
  };

  const playRecording = async () => {
    if (!recordedURI) {
      console.error('No recording available to play');
      return;
    }

    try {
      await audioRecorderPlayer.startPlayer(recordedURI);
      setPlaying(true);
      audioRecorderPlayer.addPlayBackListener((e) => {
        if (e.current_position === e.duration) {
          audioRecorderPlayer.stopPlayer();
          setPlaying(false);
          audioRecorderPlayer.removePlayBackListener();
        }
        return;
      });
    } catch (error) {
      console.error('Error playing recording:', error);
    }
  };

  return {
    startRecording,
    stopRecording,
    playRecording,
    recording,
    playing,
    recordedURI,
    hasPermission,
  };
}