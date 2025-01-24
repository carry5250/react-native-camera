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
import NativeCamera from '@react-native-oh-tpl/react-native-camera/src/NativeCamera';

const list = [
  {m: 200, size: {with: 1080, height: 1920}},
  {m: 100, size: {with: 400, height: 400}},
  {m: 300, size: {with: 100, height: 200}},
  {m: 300, size: {with: 200, height: 100}},
];

const CameraDemo = () => {
  const ref = useRef<CameraRefType>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [type, setType] = useState<'back' | 'front'>('back');
  const [useNativeZoom, setuseNativeZoom] = useState(true);
  const [photoResult, setphotoResult] = useState<any>('');
  const [playSoundOnCapture, setplaySoundOnCapture] = useState<boolean>(false);

  const onStatusChange = (e: any) => {
    console.log('我收到了', JSON.stringify(e));
  };

  const onCameraReady = () => {
    console.log('相机已经准备好了');
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.box}>
          <Text style={styles.text}>photoResult:{photoResult}</Text>
          <Text style={styles.text}>zoom:{zoom}</Text>
        </View>
        <RNCamera
          ref={ref}
          playSoundOnCapture={playSoundOnCapture}
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
          // pendingAuthorizationView={<Text>等待授权</Text>}
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
            title={'takePictureAsync'}
            onPress={async () => {
              const res = await ref.current?.takePictureAsync({
                quality: 100,
                path: '123',
              });
              console.log('res', JSON.stringify(res));
              setphotoResult(JSON.stringify(res));
            }}
          />
          <Button
            title={playSoundOnCapture ? '启用快门' : '关闭快门'}
            onPress={() => {
              setplaySoundOnCapture(v => !v);
            }}
          />
          <Button
            title={'getSupportedRatiosAsync'}
            onPress={async () => {
              const res = await ref.current?.getSupportedRatiosAsync();
              console.log('getSupportedRatiosAsync', JSON.stringify(res));
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CameraDemo;

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
