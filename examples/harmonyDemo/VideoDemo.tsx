/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useRef, useState} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {
  RNCamera,
  CameraRefType,
} from '@react-native-oh-tpl/react-native-camera/src/index';
import CustomButton from './CustomButton';

export const VideoDemo = () => {
  const ref = useRef<CameraRefType>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [type, setType] = useState<'back' | 'front'>('back');
  const [useNativeZoom, setuseNativeZoom] = useState(true);
  const [photoResult, setphotoResult] = useState<any>('');

  const [flash, setflash] = useState<'auto' | 'on' | 'off' | 'torch'>('auto');

  const [playSoundOnRecord, setplaySoundOnRecord] = useState<boolean>(true);
  const [startStatus, seteStartStatus] = useState('end');
  const [videoStabilizationMode,setvideoStabilizationMode]=useState<string>('')

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
  const toggleFlash = () => {
    if (flash === 'auto') {
      setflash('on');
    } else if (flash === 'on') {
      setflash('off');
    } else if (flash === 'off') {
      setflash('torch');
    } else {
      setflash('auto');
    }
  };
  const toggleZoom = (type: string) => {
    if (type === '+') {
      if (zoom < 10) {
        setZoom(v => v + 1);
      }
    } else {
      if (zoom > 1) {
        setZoom(v => v - 1);
      }
    }
  };

  const togglePlaySoundOnRecord = () => {
    setplaySoundOnRecord(v => !v);
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.topAction}>
          <CustomButton
            title={playSoundOnRecord ? '启用录音' : '关闭录音'}
            onPress={togglePlaySoundOnRecord}
          />
          <CustomButton
            title={useNativeZoom ? '启用缩放' : '禁用缩放'}
            onPress={() => {
              setuseNativeZoom(v => !v);
            }}
          />
          <CustomButton title={`flash: ${flash}`} onPress={toggleFlash} />
          <CustomButton
            title={type === 'front' ? '前置相机' : '后置相机'}
            onPress={() => {
              setType(v => (v === 'front' ? 'back' : 'front'));
            }}
          />
          <CustomButton
            title="  +   "
            onPress={() => {
              toggleZoom('+');
            }}
          />
          <CustomButton
            title="  -   "
            onPress={() => {
              toggleZoom('-');
            }}
          />
        </View>
        <View style={styles.textBox}>
          <Text style={styles.flipText}>videoResult:{photoResult}</Text>
          <Text style={styles.flipText}>zoom:{zoom}</Text>
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
          videoStabilizationMode={videoStabilizationMode}
        />
        <View style={styles.action}>
          <>
            {startStatus === 'end' ? (
              <CustomButton title=" 开始 " onPress={onStart}></CustomButton>
            ) : (
              ''
            )}
            {startStatus === 'start' ? (
              <CustomButton title="暂停" onPress={onPause}></CustomButton>
            ) : (
              ''
            )}
            {startStatus === 'pause' ? (
              <CustomButton title="恢复" onPress={onResume}></CustomButton>
            ) : (
              ''
            )}
            {startStatus !== 'end' ? (
              <CustomButton title="停止" onPress={onStop}></CustomButton>
            ) : (
              ''
            )}
          </>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VideoDemo;

const styles = StyleSheet.create({
  flipText: {
    color: 'red',
    fontSize: 15,
    margin: 4,
    padding: 4,
  },
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
    bottom: 50,
    zIndex: 999,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent:'center'
  },
  topAction: {
    width: '100%',
    position: 'absolute',
    top: 20,
    zIndex: 999,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 4, // 按钮之间的间距
  },
  textBox: {
    width: '100%',
    position: 'absolute',
    top: '15%',
    zIndex: 10,
  },
});
