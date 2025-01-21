import type * as React from 'react';
import { type ColorValue, type HostComponent, type ViewProps } from 'react-native';
import codegenNativeComponent from 'react-native/Libraries/Utilities/codegenNativeComponent';
import type {
  BubblingEventHandler,
  DirectEventHandler,
  Int32,
  WithDefault,
} from 'react-native/Libraries/Types/CodegenTypes';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import { TakePictureOptions } from '../types';

export type Status = 'READY' | 'PENDING_AUTHORIZATION' | 'NOT_AUTHORIZED';

export function hasTorch() {

}

type BarcodeType =
  | 'EMAIL'
  | 'PHONE'
  | 'CALENDAR_EVENT'
  | 'DRIVER_LICENSE'
  | 'GEO'
  | 'SMS'
  | 'CONTACT_INFO'
  | 'WIFI'
  | 'TEXT'
  | 'ISBN'
  | 'PRODUCT'
  | 'URL';

type Email = {
  address?: string,
  body?: string,
  subject?: string,
  emailType?: 'UNKNOWN' | 'Work' | 'Home',
};

type Point = { x: Int32, y: Int32 };

type Phone = {
  Int32?: string,
  phoneType?: 'UNKNOWN' | 'Work' | 'Home' | 'Fax' | 'Mobile',
};

export type FaceFeature = {
  bounds: {
    size: {
      width: Int32,
      height: Int32,
    },
    origin: Point,
  },
  smilingProbability?: Int32,
  leftEarPosition?: Point,
  rightEarPosition?: Point,
  leftEyePosition?: Point,
  leftEyeOpenProbability?: Int32,
  rightEyePosition?: Point,
  rightEyeOpenProbability?: Int32,
  leftCheekPosition?: Point,
  rightCheekPosition?: Point,
  leftMouthPosition?: Point,
  mouthPosition?: Point,
  rightMouthPosition?: Point,
  bottomMouthPosition?: Point,
  noseBasePosition?: Point,
  yawAngle?: Int32,
  rollAngle?: Int32,
};
type TrackedTextFeature = {
  type: string,
  bounds: {
    size: {
      width: Int32,
      height: Int32,
    },
    origin: {
      x: Int32,
      y: Int32,
    },
  },
  value: string,
  components: Array<TrackedTextFeature>,
};

type TrackedFaceFeature = FaceFeature & {
  faceID?: Int32,
};


type Rect = {
  x: Int32,
  y: Int32,
  width: Int32,
  height: Int32,
};


type TrackedBarcodeFeature = {
  bounds: {
    size: {
      width: Int32,
      height: Int32,
    },
    origin: {
      x: Int32,
      y: Int32,
    },
  },
  data: string,
  dataRaw: string,
  type: BarcodeType,
  format?: string,
  addresses?: {
    addressesType?: 'UNKNOWN' | 'Work' | 'Home',
    addressLines?: string[],
  }[],
  emails?: Email[],
  phones?: Phone[],
  urls: string[] | null | undefined,
  name?: {
    firstName?: string,
    lastName?: string,
    middleName?: string,
    prefix?: string,
    pronounciation?: string,
    suffix?: string,
    formattedName?: string,
  },
  phone?: Phone,
  organization?: string,
  latitude?: Int32,
  longitude?: Int32,
  ssid?: string,
  password?: string,
  encryptionType?: string,
  title?: string,
  url?: string,
  firstName?: string,
  middleName?: string,
  lastName?: string,
  gender?: string,
  addressCity?: string,
  addressState?: string,
  addressStreet?: string,
  addressZip?: string,
  birthDate?: string,
  documentType?: string,
  licenseInt32?: string,
  expiryDate?: string,
  issuingDate?: string,
  issuingCountry?: string,
  eventDescription?: string,
  location?: string,
  organizer?: string,
  status?: string,
  summary?: string,
  start?: string,
  end?: string,
  email?: Email,
  phoneInt32?: string,
  message?: string,
};

type FlashModeType = WithDefault<'auto' | 'on' | 'off', 'auto'>

interface PropsType {
  zoom?: Int32,
  useNativeZoom?: WithDefault<boolean, true>,
  maxZoom?: Int32,
  ratio?: string,
  focusDepth?: Int32,
  type?: string,
  onCameraReady?: BubblingEventHandler<Readonly<{}>>,
  onAudioInterrupted?: BubblingEventHandler<Readonly<{}>>,
  onAudioConnected?: BubblingEventHandler<Readonly<{}>>,
  onStatusChange?: BubblingEventHandler<Readonly<{}>>,
  onBarCodeRead?: BubblingEventHandler<Readonly<{}>>,
  onPictureTaken?: BubblingEventHandler<Readonly<{}>>,
  onPictureSaved?: BubblingEventHandler<Readonly<{}>>,
  onRecordingStart?: BubblingEventHandler<Readonly<{}>>,
  onRecordingEnd?: BubblingEventHandler<Readonly<{}>>,
  onTap?: BubblingEventHandler<Readonly<{}>>,
  onDoubleTap?: BubblingEventHandler<Readonly<{}>>,
  onGoogleVisionBarcodesDetected?: BubblingEventHandler<{ barcodes: Array<TrackedBarcodeFeature> }>,
  onSubjectAreaChanged?: BubblingEventHandler<{ nativeEvent: { prevPoint: { x: Int32, y: Int32 } } }>,
  faceDetectionMode?: Int32,
  trackingEnabled?: boolean,
  flashMode?: FlashModeType,
  exposure?: Int32,
  barCodeTypes?: Array<string>,
  googleVisionBarcodeType?: Int32,
  googleVisionBarcodeMode?: Int32,
  whiteBalance?: Int32,
  faceDetectionLandmarks?: Int32,
  autoFocus?: string,
  autoFocusPointOfInterest?: { x: Int32, y: Int32 },
  faceDetectionClassifications?: Int32,
  onFacesDetected?: BubblingEventHandler<{ faces: Array<TrackedFaceFeature> }>,
  onTextRecognized?: BubblingEventHandler<{ textBlocks: Array<TrackedTextFeature> }>,
  captureAudio?: boolean,
  keepAudioSession?: boolean,
  useCamera2Api?: boolean,
  playSoundOnCapture?: boolean,
  playSoundOnRecord?: boolean,
  videoStabilizationMode?: Int32,
  pictureSize?: string,
  rectOfInterest: Rect,
};

export type RecordAudioPermissionStatus = WithDefault<'AUTHORIZED' | 'NOT_AUTHORIZED' | 'PENDING_AUTHORIZATION', 'AUTHORIZED'>

type StateType = {
  isAuthorized: boolean,
  isAuthorizationChecked: boolean,
  recordAudioPermissionStatus?: RecordAudioPermissionStatus,
};


export type OnTouchEventData = Readonly<{
  type: Int32;
}>;

export interface NativeProps extends ViewProps, PropsType, StateType {
  text?: string;
  color?: ColorValue,
  onTextTouch?: DirectEventHandler<OnTouchEventData>;
  // 在这里添加其他 props
}

export type CameraComponentType = HostComponent<NativeProps>



export default codegenNativeComponent<NativeProps>(
  'RTNCameraView',
) as HostComponent<NativeProps>;