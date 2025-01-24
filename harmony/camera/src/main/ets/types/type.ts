import { camera } from "@kit.CameraKit";

type Orientation = 'auto' | 'landscapeLeft' | 'landscapeRight' | 'portrait' | 'portraitUpsideDown';
type OrientationNumber = 1 | 2 | 3 | 4;

interface Point<T = number> {
  x: T;
  y: T;
}

type FaceFeature = {
  bounds: {
    size: {
      width: number,
      height: number,
    },
    origin: Point,
  },
  smilingProbability?: number,
  leftEarPosition?: Point,
  rightEarPosition?: Point,
  leftEyePosition?: Point,
  leftEyeOpenProbability?: number,
  rightEyePosition?: Point,
  rightEyeOpenProbability?: number,
  leftCheekPosition?: Point,
  rightCheekPosition?: Point,
  leftMouthPosition?: Point,
  mouthPosition?: Point,
  rightMouthPosition?: Point,
  bottomMouthPosition?: Point,
  noseBasePosition?: Point,
  yawAngle?: number,
  rollAngle?: number,
};

type PictureOptions = {
  quality?: number,
  orientation?: Orientation | OrientationNumber,
  base64?: boolean,
  mirrorImage?: boolean,
  exif?: boolean,
  writeExif?: boolean | { [name: string]: any },
  width?: number,
  fixOrientation?: boolean,
  forceUpOrientation?: boolean,
  pauseAfterCapture?: boolean,
};

type TrackedFaceFeature = FaceFeature & {
  faceID?: number,
};

export type RecordOptions = { quality?: string, orientation?: Object, maxDuration?: number, maxFileSize?: number, mute?: boolean, mirrorVideo?: boolean, path?: string, videoBitrate?: number, codec?: string, fps?: number }

export type HardwareCamera = { deviceType?: string, id: string, type: number }

export type TakePictureOptions = {
  rotation?: string | number; quality?: number, base64?: boolean, exif?: boolean, width?: number, mirrorImage?: boolean, doNotSave?: boolean, pauseAfterCapture?: boolean, fixOrientation?: boolean, forceUpOrientation?: boolean, imageType?: string, path?: string
}

export type TakePictureResponse = { width: number, height: number, uri: string, base64?: string, pictureOrientation: number, deviceOrientation: number }


export type RecordResponse = { uri: string, videoOrientation: number, deviceOrientation: number, isRecordingInterrupted: boolean, codec?: string }


type TrackedBarcodeFeature = {
  bounds: {
    size: {
      width: number,
      height: number,
    },
    origin: {
      x: number,
      y: number,
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
  latitude?: number,
  longitude?: number,
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
  licenseNumber?: string,
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
  phoneNumber?: string,
  message?: string,
};


type RecordingOptions = {
  maxDuration?: number,
  maxFileSize?: number,
  orientation?: Orientation,
  quality?: number | string,
  fps?: number,
  codec?: string,
  mute?: boolean,
  path?: string,
  videoBitrate?: number,
};

type EventCallbackArgumentsType = {
  nativeEvent: Object,
};

type Rect = {
  x: number,
  y: number,
  width: number,
  height: number,
};

type FaceDetectionMode = Readonly<{ fast: any; accurate: any }>;
type FlashModeType = 'auto' | 'on' | 'off' | "torch"

export type CameraError = {}

export type CameraProps = {
  zoomMode?: ZoomMode; //是否启用变焦功能，默认开启
  flashMode?: FlashModeType; //闪光灯模式
  focusMode?: camera.FocusMode; //对焦模式
  torchMode?: TorchMode; // 手电模式
  zoom?: number,
  useNativeZoom?: boolean,
  maxZoom?: number,
  ratio?: string,
  focusDepth?: number,
  type?: 'front' | 'back',
  onCameraReady?: Function,
  onAudioInterrupted?: Function,
  onAudioConnected?: Function,
  onStatusChange?: Function,
  onBarCodeRead?: Function,
  onPictureTaken?: Function,
  onPictureSaved?: Function,
  onRecordingStart?: Function,
  onRecordingEnd?: Function,
  onTap?: Function,
  onDoubleTap?: Function,
  onGoogleVisionBarcodesDetected?: { barcodes: Array<TrackedBarcodeFeature> },
  onSubjectAreaChanged?: { nativeEvent: { prevPoint: { x: number, y: number } } },
  faceDetectionMode?: string;
  trackingEnabled?: boolean,
  exposure?: number,
  barCodeTypes?: Array<string>,
  googleVisionBarcodeType?: string,
  googleVisionBarcodeMode?: string,
  whiteBalance?: number,
  faceDetectionLandmarks?: number,
  autoFocus?: string,
  autoFocusPointOfInterest?: { x: number, y: number },
  faceDetectionClassifications?: number,
  onFacesDetected?: { faces: Array<TrackedFaceFeature> },
  onTextRecognized?: { textBlocks: Array<TrackedTextFeature> },
  captureAudio?: boolean,
  keepAudioSession?: boolean,
  useCamera2Api?: boolean,
  playSoundOnCapture?: boolean,
  playSoundOnRecord?: boolean,
  videoStabilizationMode?: number,
  pictureSize?: string,
  rectOfInterest?: Rect,
  cameraId?: string;
  onMountError?: { error: { message: string } },
  detectedImageInEvent?: boolean;
};

export enum CameraType {
  Front = 'front',
  Back = 'back',
}

export type CodeFormat =
  | 'code-128'
    | 'code-39'
    | 'code-93'
    | 'codabar'
    | 'ean-13'
    | 'ean-8'
    | 'itf'
    | 'upc-e'
    | 'qr'
    | 'pdf-417'
    | 'aztec'
    | 'data-matrix'
    | 'unknown';

export type TorchMode = 'on' | 'off';


export type ZoomMode = 'on' | 'off';

export type ResizeMode = 'cover' | 'contain';

export type CaptureData = {
  uri: string;
  name: string;
  height: number;
  width: number;
  // Android only
  id?: string;
  path?: string;
  // iOS only
  size?: number;
};

export type CameraApi = {
  capture: () => Promise<CaptureData>;
  requestDeviceCameraAuthorization: () => Promise<boolean>;
  checkDeviceCameraAuthorizationStatus: () => Promise<boolean>;
};


export enum FocusMode {
  /**
   * Manual mode.
   *
   * @syscap SystemCapability.Multimedia.Camera.Core
   * @since 10
   */
  FOCUS_MODE_MANUAL = 0,
  /**
   * Continuous auto mode.
   *
   * @syscap SystemCapability.Multimedia.Camera.Core
   * @since 10
   */
  FOCUS_MODE_CONTINUOUS_AUTO = 1,
  /**
   * Auto mode.
   *
   * @syscap SystemCapability.Multimedia.Camera.Core
   * @since 10
   */
  FOCUS_MODE_AUTO = 2,
  /**
   * Locked mode.
   *
   * @syscap SystemCapability.Multimedia.Camera.Core
   * @since 10
   */
  FOCUS_MODE_LOCKED = 3
}


export interface BoxSizes {
  centerSize: {
    width: number;
    height: number;
  };
  sideSize: {
    width: number;
    height: number;
  };
}

type AutoFocus = Readonly<{ on: any; off: any }>;
type VideoStabilization = Readonly<{ off: any; standard: any; cinematic: any; auto: any }>;
type FlashMode = Readonly<{ on: any; off: any; torch: any; auto: any }>;
type WhiteBalance = Readonly<{
  sunny: any;
  cloudy: any;
  shadow: any;
  incandescent: any;
  fluorescent: any;
  auto: any;
}>;
type CustomWhiteBalance = {
  temperature: number;
  tint: number;
  redGainOffset?: number;
  greenGainOffset?: number;
  blueGainOffset?: number;
};

export type BarCodeType = Readonly<{
  aztec: any;
  code128: any;
  code39: any;
  code39mod43: any;
  code93: any;
  ean13: any;
  ean8: any;
  pdf417: any;
  qr: any;
  upc_e: any;
  interleaved2of5: any;
  itf14: any;
  datamatrix: any;
}>;

export type VideoQuality = Readonly<{
  '2160p': any;
  '1080p': any;
  '720p': any;
  '480p': any;
  '4:3': any;
  /** iOS Only. Android not supported. */
  '288p': any;
}>;

export type VideoCodec = Readonly<{
  H264: symbol;
  JPEG: symbol;
  HVEC: symbol;
  AppleProRes422: symbol;
  AppleProRes4444: symbol;
}>;

export type ImageType = Readonly<{
  'jpeg': any;
  'png': any;
}>;

type FaceDetectionClassifications = Readonly<{ all: any; none: any }>;
type FaceDetectionLandmarks = Readonly<{ all: any; none: any }>;
type GoogleVisionBarcodeType = Readonly<{
  CODE_128: any;
  CODE_39: any;
  CODABAR: any;
  DATA_MATRIX: any;
  EAN_13: any;
  EAN_8: any;
  ITF: any;
  QR_CODE: any;
  UPC_A: any;
  UPC_E: any;
  PDF417: any;
  AZTEC: any;
  ALL: any;
}>;
type GoogleVisionBarcodeMode = Readonly<{ NORMAL: any; ALTERNATE: any; INVERTED: any }>;

// FaCC (Function as Child Components)
type Self<T> = { [P in keyof T]: P };

export type CameraStatus = Readonly<Self<{ READY: any; PENDING_AUTHORIZATION: any; NOT_AUTHORIZED: any }>>;

export type RecordAudioPermissionStatus = Readonly<Self<{
  AUTHORIZED: 'AUTHORIZED';
  PENDING_AUTHORIZATION: 'PENDING_AUTHORIZATION';
  NOT_AUTHORIZED: 'NOT_AUTHORIZED';
}>>;


export interface Constants {
  CameraStatus: CameraStatus;
  AutoFocus: AutoFocus;
  FlashMode: FlashMode;
  VideoCodec: VideoCodec;
  Type: CameraType;
  WhiteBalance: WhiteBalance;
  VideoQuality: VideoQuality;
  ImageType: ImageType;
  BarCodeType: BarCodeType;
  FaceDetection: {
    Classifications: FaceDetectionClassifications;
    Landmarks: FaceDetectionLandmarks;
    Mode: FaceDetectionMode;
  };
  GoogleVisionBarcodeDetection: {
    BarcodeType: GoogleVisionBarcodeType;
    BarcodeMode: GoogleVisionBarcodeMode;
  };
  Orientation: {
    auto: 'auto';
    landscapeLeft: 'landscapeLeft';
    landscapeRight: 'landscapeRight';
    portrait: 'portrait';
    portraitUpsideDown: 'portraitUpsideDown';
  };
  VideoStabilization: VideoStabilization;
}

export interface BarCodeReadEvent {
  data: string;
  rawData?: string;
  type: keyof BarCodeType;

  /**
   * @description For Android use `{ width: number, height: number, origin: Array<Point<string>> }`
   * @description For iOS use `{ origin: Point<string>, size: Size<string> }`
   */
  bounds:
    | { width: number; height: number; origin: Array<Point<string>> }
    | { origin: Point<string>; size: Size<string> };

  /**
   * Raw image bytes in JPEG format (quality 100) as Base64-encoded string, only provided if `detectedImageInEvent=true`.
   */
  image: string;
}

export interface GoogleVisionBarcodesDetectedEvent {
  type: string;
  barcodes: Barcode[];
  target: number;

  /**
   * Raw image bytes in JPEG format (quality 100) as Base64-encoded string, only provided if `detectedImageInEvent=true`.
   */
  image?: string;
}

export interface RNCameraProps {
  cameraId?: string;
  autoFocus?: keyof AutoFocus;
  autoFocusPointOfInterest?: Point;
  pictureSize?: string;

  /* iOS only */
  onSubjectAreaChanged?: (event: { nativeEvent: { prevPoint: { x: number; y: number } } }) => void;
  type?: keyof CameraType;
  flashMode?: keyof FlashMode;
  useCamera2Api?: boolean;
  exposure?: number;
  whiteBalance?: keyof WhiteBalance | CustomWhiteBalance;
  captureAudio?: boolean;

  onCameraReady?(): void;

  onStatusChange?(event: {
    cameraStatus: keyof CameraStatus;
    recordAudioPermissionStatus: keyof RecordAudioPermissionStatus;
  }): void;

  onMountError?(error: { message: string }): void;

  onPictureTaken?(): void;

  onRecordingStart?(event: {
    nativeEvent: {
      uri: string;
      videoOrientation: number;
      deviceOrientation: number;
    };
  }): void;

  onRecordingEnd?(): void;

  /** iOS only */
  onAudioInterrupted?(): void;

  onAudioConnected?(): void;

  onTap?(origin: Point): void;

  onDoubleTap?(origin: Point): void;

  /** Use native pinch to zoom implementation*/
  useNativeZoom?: boolean;

  /** Value: float from 0 to 1.0 */
  zoom?: number;

  /** iOS only. float from 0 to any. Locks the max zoom value to the provided value
   A value <= 1 will use the camera's max zoom, while a value > 1
   will use that value as the max available zoom
   **/
  maxZoom?: number;

  /** Value: float from 0 to 1.0 */
  focusDepth?: number;

  // -- BARCODE PROPS
  detectedImageInEvent?: boolean;
  barCodeTypes?: Array<keyof BarCodeType>;
  googleVisionBarcodeType?: Constants['GoogleVisionBarcodeDetection']['BarcodeType'];
  googleVisionBarcodeMode?: Constants['GoogleVisionBarcodeDetection']['BarcodeMode'];

  onBarCodeRead?(event: BarCodeReadEvent): void;

  onGoogleVisionBarcodesDetected?(event: GoogleVisionBarcodesDetectedEvent): void;

  // limiting scan area
  rectOfInterest?: RectOfInterest;

  // -- FACE DETECTION PROPS

  onFacesDetected?(response: { faces: Face[] }): void;

  onFaceDetectionError?(response: { isOperational: boolean }): void;

  faceDetectionMode?: keyof FaceDetectionMode;
  faceDetectionLandmarks?: keyof FaceDetectionLandmarks;
  faceDetectionClassifications?: keyof FaceDetectionClassifications;
  trackingEnabled?: boolean;

  onTextRecognized?(response: { textBlocks: TrackedTextFeature[] }): void;

  // -- ANDROID ONLY PROPS
  /** Android only */
  ratio?: string;

  /** Android only - Deprecated */
  permissionDialogTitle?: string;

  /** Android only - Deprecated */
  permissionDialogMessage?: string;

  /** Android only */
  playSoundOnCapture?: boolean;

  /** Android only */
  playSoundOnRecord?: boolean;
  androidCameraPermissionOptions?: {
    title: string;
    message: string;
    buttonPositive?: string;
    buttonNegative?: string;
    buttonNeutral?: string;
  } | null;
  androidRecordAudioPermissionOptions?: {
    title: string;
    message: string;
    buttonPositive?: string;
    buttonNegative?: string;
    buttonNeutral?: string;
  } | null;

  // limiting scan area, must provide cameraViewDimensions for Android
  cameraViewDimensions?: Object;

  // -- IOS ONLY PROPS
  videoStabilizationMode?: keyof VideoStabilization;
  defaultVideoQuality?: keyof VideoQuality;

  /* if true, audio session will not be released on component unmount */
  keepAudioSession?: boolean;
}

interface Point<T = number> {
  x: T;
  y: T;
}

interface Size<T = number> {
  width: T;
  height: T;
}

interface RectOfInterest extends Point, Size {}

export interface Barcode {
  bounds: {
    size: Size;
    origin: Point;
  };
  data: string;
  dataRaw: string;
  type: BarcodeType;
  format?: string;
  addresses?: {
    addressesType?: 'UNKNOWN' | 'Work' | 'Home';
    addressLines?: string[];
  }[];
  emails?: Email[];
  phones?: Phone[];
  urls?: string[];
  name?: {
    firstName?: string;
    lastName?: string;
    middleName?: string;
    prefix?: string;
    pronounciation?: string;
    suffix?: string;
    formattedName?: string;
  };
  phone?: Phone;
  organization?: string;
  latitude?: number;
  longitude?: number;
  ssid?: string;
  password?: string;
  encryptionType?: string;
  title?: string;
  url?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  gender?: string;
  addressCity?: string;
  addressState?: string;
  addressStreet?: string;
  addressZip?: string;
  birthDate?: string;
  documentType?: string;
  licenseNumber?: string;
  expiryDate?: string;
  issuingDate?: string;
  issuingCountry?: string;
  eventDescription?: string;
  location?: string;
  organizer?: string;
  status?: string;
  summary?: string;
  start?: string;
  end?: string;
  email?: Email;
  phoneNumber?: string;
  message?: string;
}

export type BarcodeType =
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

export interface Email {
  address?: string;
  body?: string;
  subject?: string;
  emailType?: 'UNKNOWN' | 'Work' | 'Home';
}

export interface Phone {
  number?: string;
  phoneType?: 'UNKNOWN' | 'Work' | 'Home' | 'Fax' | 'Mobile';
}

export interface Face {
  faceID?: number;
  bounds: {
    size: Size;
    origin: Point;
  };
  smilingProbability?: number;
  leftEarPosition?: Point;
  rightEarPosition?: Point;
  leftEyePosition?: Point;
  leftEyeOpenProbability?: number;
  rightEyePosition?: Point;
  rightEyeOpenProbability?: number;
  leftCheekPosition?: Point;
  rightCheekPosition?: Point;
  leftMouthPosition?: Point;
  mouthPosition?: Point;
  rightMouthPosition?: Point;
  bottomMouthPosition?: Point;
  noseBasePosition?: Point;
  yawAngle?: number;
  rollAngle?: number;
}

export interface TrackedTextFeatureRecursive {
  type: 'block' | 'line' | 'element';
  bounds: {
    size: Size;
    origin: Point;
  };
  value: string;
  components?: TrackedTextFeatureRecursive[];
}

export interface TrackedTextFeature extends TrackedTextFeatureRecursive {
  components: TrackedTextFeatureRecursive[];
}


interface DetectionOptions {
  mode?: keyof FaceDetectionMode;
  detectLandmarks?: keyof FaceDetectionLandmarks;
  runClassifications?: keyof FaceDetectionClassifications;
}


export interface AllPermissionStatus {
  cameraStatus: string;
  recordAudioPermissionStatus: string;
}

export interface CameraIdsType extends camera.CameraDevice {
  id: string,
  type: string
}
