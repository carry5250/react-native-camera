/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React, {useRef, useState} from 'react';
import {
  Alert,
  Button,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import {
  RNCamera,
  CameraRefType,
} from '@react-native-oh-tpl/react-native-camera/src/index';
import CustomButton from './CustomButton';

const CameraDemo = () => {
  const ref = useRef<CameraRefType>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [type, setType] = useState<'back' | 'front'>('back');
  const [useNativeZoom, setuseNativeZoom] = useState(true);
  const [photoResult, setphotoResult] = useState<any>('');
  const [playSoundOnCapture, setplaySoundOnCapture] = useState<boolean>(false);
  const [flash, setflash] = useState<'auto' | 'on' | 'off' | 'torch'>('auto');
  const [maxZoom, setMaxZoom] = useState<number>(10);
  const [errorText, seterrorText] = useState<string>('');

  const onStatusChange = (e: any) => {
    console.log('我收到了', JSON.stringify(e));
  };

  const onCameraReady = () => {
    console.log('相机已经准备好了');
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
      if (zoom < maxZoom) {
        setZoom(v => v + 1);
      }
    } else {
      if (zoom > 1) {
        setZoom(v => v - 1);
      }
    }
  };

  const onReset = () => {
    setZoom(1);
    setflash('auto');
    setphotoResult('');
  };

  const onMountError = (error: {message: string}) => {
    seterrorText(error.message);
  };
  const onPictureTaken = () => {
    console.log('我按下了拍照！！！');
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        <View style={styles.textBox}>
          <Text style={styles.flipText}>ZOOM:{zoom}</Text>
          <Text style={styles.flipText}>errorText:{errorText}</Text>
          <Text style={styles.flipText}>photoResult:{photoResult}</Text>
        </View>
        <View style={styles.topAction}>
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
            title={playSoundOnCapture ? '启用快门' : '关闭快门'}
            onPress={() => {
              setplaySoundOnCapture(v => !v);
            }}
          />
          <CustomButton
            title={`maxZoom:${maxZoom}`}
            onPress={() => {
              setMaxZoom(v => (v === 10 ? 5 : 10));
            }}
          />
          <CustomButton title="reset" onPress={onReset} />
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
          flashMode={flash}
          type={type}
          notAuthorizedView={<Text>等待中</Text>}
          // pendingAuthorizationView={<Text>等待授权</Text>}
          onMountError={onMountError}
          onPictureTaken={onPictureTaken}
        />
        <View style={styles.action}>
          <CustomButton
            title={'takePictureAsync'}
            onPress={async () => {
              const res = await ref.current?.takePictureAsync({
                quality: 100,
                path: '123',
              });
              if (res) {
                Alert.alert(JSON.stringify(res));
              }
            }}
          />

          <CustomButton
            title={'getSupportedRatiosAsync'}
            onPress={async () => {
              const res = await ref.current?.getSupportedRatiosAsync();
              if (res) {
                Alert.alert(JSON.stringify(res));
              }
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CameraDemo;

const styles = StyleSheet.create({
  flipText: {
    color: 'white',
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
    top: '30%',
    zIndex: 10,
  },
});
