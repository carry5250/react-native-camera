import type * as React from 'react';
import { type HostComponent, type ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type { Int32, WithDefault } from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import { HardwareCamera, RecordResponse, TakePictureResponse } from '../types';
import { UnsafeMixed } from './codegenUtils';

export type Status = 'READY' | 'PENDING_AUTHORIZATION' | 'NOT_AUTHORIZED';

export function hasTorch() {}

type Point = { x: Int32; y: Int32 };

export type FaceFeature = {
  bounds: {
    size: {
      width: Int32;
      height: Int32;
    };
    origin: Point;
  };
  smilingProbability?: Int32;
  leftEarPosition?: Point;
  rightEarPosition?: Point;
  leftEyePosition?: Point;
  leftEyeOpenProbability?: Int32;
  rightEyePosition?: Point;
  rightEyeOpenProbability?: Int32;
  leftCheekPosition?: Point;
  rightCheekPosition?: Point;
  leftMouthPosition?: Point;
  mouthPosition?: Point;
  rightMouthPosition?: Point;
  bottomMouthPosition?: Point;
  noseBasePosition?: Point;
  yawAngle?: Int32;
  rollAngle?: Int32;
};

type FlashModeType = WithDefault<'auto' | 'on' | 'off' | 'torch', 'auto'>;

interface PropsType {
  zoom?: WithDefault<Int32, 1.0>;
  useNativeZoom?: WithDefault<boolean, true>;
  maxZoom?: Int32;
  ratio?: string;
  focusDepth?: WithDefault<Int32, 1.0>;
  type?: WithDefault<'front' | 'back', 'front'>;
  faceDetectionMode?: string;
  trackingEnabled?: boolean;
  flashMode?: FlashModeType;
  exposure?: Int32;
  barCodeTypes?: Array<string>;
  googleVisionBarcodeType?: string;
  googleVisionBarcodeMode?: string;
  whiteBalance?: Int32;
  faceDetectionLandmarks?: Int32;
  autoFocus?: string;
  autoFocusPointOfInterest?: UnsafeMixed<{ x: Int32; y: Int32 }>;
  faceDetectionClassifications?: Int32;
  captureAudio?: boolean;
  keepAudioSession?: boolean;
  useCamera2Api?: boolean;
  playSoundOnCapture?: boolean;
  playSoundOnRecord?: boolean;
  videoStabilizationMode?: string;
  pictureSize?: string;
  rectOfInterest?: UnsafeMixed<{ x: Int32; y: Int32; width: Int32; height: Int32 }>;
  ///
  cameraId?: string;
  detectedImageInEvent?: boolean;
  video?: boolean;
  defaultVideoQuality?: string;
  cameraViewDimensions?: UnsafeMixed<{ width: Int32; height: Int32 }>;
  textRecognizedEnabled?: boolean;
  faceDetectionEnabled?: boolean;
  barcodeDetectionEnabled?: boolean;
}

export type RecordAudioPermissionStatus = WithDefault<
  'AUTHORIZED' | 'NOT_AUTHORIZED' | 'PENDING_AUTHORIZATION',
  'AUTHORIZED'
>;

export const CameraCommands = codegenNativeCommands<CameraCommandsType>({
  supportedCommands: [
    'takePictureAsync',
    'recordAsync',
    'refreshAuthorizationStatus',
    'stopRecording',
    'pausePreview',
    'resumePreview',
    'getSupportedRatiosAsync',
    'checkIfVideoIsValid',
    'getCameraIdsAsync',
    'isRecording',
    'getSupportedPreviewFpsRange',
    'getAvailablePictureSizes',
  ],
});

export type CameraComponentType = HostComponent<NativeProps>;

export interface CameraCommandsType {
  takePictureAsync(viewRef: React.ElementRef<CameraComponentType>): Promise<TakePictureResponse>;
  recordAsync(viewRef: React.ElementRef<CameraComponentType>): Promise<RecordResponse>;
  refreshAuthorizationStatus(viewRef: React.ElementRef<CameraComponentType>): Promise<void>;
  stopRecording(viewRef: React.ElementRef<CameraComponentType>): void;
  pausePreview(viewRef: React.ElementRef<CameraComponentType>): void;
  resumePreview(viewRef: React.ElementRef<CameraComponentType>): void;
  getSupportedRatiosAsync(viewRef: React.ElementRef<CameraComponentType>): Promise<string[]>;
  checkIfVideoIsValid(viewRef: React.ElementRef<CameraComponentType>): Promise<boolean>;
  getCameraIdsAsync: (viewRef: React.ElementRef<CameraComponentType>) => Promise<HardwareCamera[]>;
  isRecording: (viewRef: React.ElementRef<CameraComponentType>) => Promise<boolean>;
  getSupportedPreviewFpsRange: (
    viewRef: React.ElementRef<CameraComponentType>,
  ) => Promise<string[]>;
  getAvailablePictureSizes: (viewRef: React.ElementRef<CameraComponentType>) => Promise<string[]>;
}

export type OnTouchEventData = Readonly<{
  type: Int32;
}>;

export interface NativeProps extends ViewProps, PropsType {}

export default codegenNativeComponent<NativeProps>('RTNCameraView') as CameraComponentType;
