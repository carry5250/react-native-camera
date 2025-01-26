/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useRef, useState} from 'react';
import {Button, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {
  RNCamera,
  CameraRefType,
} from '@react-native-oh-tpl/react-native-camera/src/index';

export const VideoDemo = () => {
  const ref = useRef<CameraRefType>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [type, setType] = useState<'back' | 'front'>('back');
  const [useNativeZoom, setuseNativeZoom] = useState(true);
  const [photoResult, setphotoResult] = useState<any>('');
  const [playSoundOnRecord, setplaySoundOnRecord] = useState<boolean>(false);
  const [startStatus, seteStartStatus] = useState('end');

  const onStatusChange = (e: any) => {
    console.log('我收到了', JSON.stringify(e));
  };

  const onCameraReady = () => {
    console.log('相机已经准备好了');
  };

  const onStart = () => {
    seteStartStatus('start');
    ref.current?.recordAsync();
  };
  const onPause = () => {
    seteStartStatus('pause');
    ref.current?.pausePreview();
  };
  const onResume = () => {
    seteStartStatus('pesume');
    ref.current?.resumePreview();
  };
  const onStop = () => {
    seteStartStatus('end');
    ref.current?.stopRecording();
  };
  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.box}>
          <Text style={styles.text}>videoResult:{photoResult}</Text>
          <Text style={styles.text}>zoom:{zoom}</Text>
        </View>
        <RNCamera
          ref={ref}
          useNativeZoom={useNativeZoom}
          captureAudio
          zoom={zoom}
          maxZoom={20}
          style={{width: '100%', height: '100%'}}
          onStatusChange={onStatusChange}
          onCameraReady={onCameraReady}
          flashMode={'auto'}
          type={type}
          notAuthorizedView={<Text>等待中</Text>}
          video
          playSoundOnRecord={playSoundOnRecord}
        />
        <View style={styles.action}>
          <Button
            title="    +    "
            onPress={() => {
              setZoom(v => v + 0.5);
            }}
          />
          <Button
            title="   -   "
            onPress={() => {
              setZoom(v => v - 0.5);
            }}
          />
          <Button
            title="resSetZoom"
            onPress={() => {
              setZoom(1);
            }}
          />
          <>
            {startStatus === 'end' ? (
              <Button title="开始" onPress={onStart}></Button>
            ) : (
              ''
            )}
            {startStatus === 'start' ? (
              <Button title="暂停" onPress={onPause}></Button>
            ) : (
              ''
            )}
            {startStatus === 'pause' ? (
              <Button title="恢复" onPress={onResume}></Button>
            ) : (
              ''
            )}
            {startStatus !== 'end' ? (
              <Button title="停止" onPress={onStop}></Button>
            ) : (
              ''
            )}
          </>
          <Button
            title={type === 'front' ? '前置' : '后置'}
            onPress={() => {
              setType(v => (v === 'front' ? 'back' : 'front'));
            }}
          />
          <Button
            title={useNativeZoom ? '启用缩放' : '禁用缩放'}
            onPress={() => {
              setuseNativeZoom(v => !v);
            }}
          />
          <Button
            title={playSoundOnRecord ? '启用录音' : '关闭录音'}
            onPress={() => {
              setplaySoundOnRecord(v => !v);
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VideoDemo;

const styles = StyleSheet.create({
  text: {color: '#fff'},
  btn: {
    minWidth: 20,
  },
  container: {
    height: '100%',
    width: '100%',
    position: 'relative',
  },
  action: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    zIndex: 999,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  box: {
    width: '100%',
    position: 'absolute',
    top: 0,
    zIndex: 999,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
});
