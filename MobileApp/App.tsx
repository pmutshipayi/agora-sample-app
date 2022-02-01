import React, {useCallback, useEffect, useState} from 'react';
import {
  Platform,
  Text,
  TouchableOpacity,
  View,
  PermissionsAndroid,
} from 'react-native';
// Import the RtcEngine class and view rendering components into your project.
import RtcEngine from 'react-native-agora';
// Import the UI styles.
import styles from './src/components/style';

// Define a State interface.
interface State {
  appId: string;
  channelName: string;
  token: string;
  joinSucceed: boolean;
  peerIds: number[];
}

const App = () => {
  const [engine, setEngine] = useState<RtcEngine>();
  const [config, setConfig] = useState<State>({
    appId: 'be4861b5d0354473bd432bacebd04c0e',
    channelName: 'mutshi',
    token:
      '006be4861b5d0354473bd432bacebd04c0eIAAfR92I8AyXAk/EIpQ99d5bDexz08ZegrLyVzPjTFOkSAkLOh8AAAAAEAD1z9KPdB/6YQEAAQB0H/ph',
    joinSucceed: false,
    peerIds: [],
  });

  const init = useCallback(async () => {
    const {appId} = config;
    const _engine = await RtcEngine.create(appId);
    // Enable the video module.
    await _engine.enableAudio();

    // Listen for the UserJoined callback.
    // This callback occurs when the remote user successfully joins the channel.
    _engine.addListener('UserJoined', (uid, elapsed) => {
      console.log('UserJoined', uid, elapsed);
      const {peerIds} = config;
      if (peerIds.indexOf(uid) === -1) {
        setConfig({...config, peerIds: [...peerIds, uid]});
      }
    });

    // Listen for the UserOffline callback.
    // This callback occurs when the remote user leaves the channel or drops offline.
    _engine.addListener('UserOffline', (uid: any, reason: any) => {
      console.log('UserOffline', uid, reason);
      const {peerIds} = config;
      setConfig({...config, peerIds: peerIds.filter(id => id !== uid)});
    });

    // Listen for the JoinChannelSuccess callback.
    // This callback occurs when the local user successfully joins the channel.
    _engine.addListener('JoinChannelSuccess', (channel, uid, elapsed) => {
      console.log('JoinChannelSuccess', channel, uid, elapsed);
      setConfig({...config, joinSucceed: true});
    });

    setEngine(_engine);
  }, [config]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestCameraAndAudioPermission().then(() => {
        console.log('requested!');
      });
    }
    init();
  }, [init]);

  const requestCameraAndAudioPermission = async () => {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
      if (
        granted['android.permission.RECORD_AUDIO'] ===
          PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.CAMERA'] ===
          PermissionsAndroid.RESULTS.GRANTED
      ) {
        console.log('You can use the cameras & mic');
      } else {
        console.log('Permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const startCall = async () => {
    await engine?.joinChannel(config.token, config.channelName, null, 0);
  };

  const endCall = async () => {
    await engine?.leaveChannel();
    setConfig({...config, peerIds: [], joinSucceed: false});
  };

  return (
    <View style={styles.max}>
      <View style={styles.max}>
        <View style={styles.buttonHolder}>
          <TouchableOpacity onPress={startCall} style={styles.button}>
            <Text style={styles.buttonText}> Start Call </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={endCall} style={styles.button}>
            <Text style={styles.buttonText}> End Call </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default App;
