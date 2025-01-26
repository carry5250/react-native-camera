import React, { useEffect, useState } from 'react';
import { HostComponent, View, StyleSheet, DeviceEventEmitter } from 'react-native';
import { NativeProps } from './RTNCameraNativeComponent';
import {
  BarCodeReadEvent,
  Face,
  GoogleVisionBarcodesDetectedEvent,
  HardwareCamera,
  Orientation,
  OrientationNumber,
  Point,
  RecordResponse,
  TakePictureOptions,
  TrackedTextFeature,
  VideoCodec,
  VideoQuality,
} from '../types';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import NativeVisionCameraView from './RTNCameraNativeComponent';
import codegenNativeCommands from 'react-native/Libraries/Utilities/codegenNativeCommands';
import NativeEvent from './NativeCamera';

type CameraCommands =
  | 'takePictureAsync'
  | 'recordAsync'
  | 'refreshAuthorizationStatus'
  | 'stopRecording'
  | 'pausePreview'
  | 'resumePreview'
  | 'getSupportedRatiosAsync'
  | 'checkIfVideoIsValid'
  | 'getCameraIdsAsync'
  | 'isRecording';

type CameraComponentType = HostComponent<NativeProps>;

interface TakePictureResponse {
  width: number;
  height: number;
  uri: string;
  base64?: string;
  exif?: { [name: string]: any };
  pictureOrientation: number;
  deviceOrientation: number;
}

interface RecordOptions {
  quality?: keyof VideoQuality;
  orientation?: keyof Orientation | OrientationNumber;
  maxDuration?: number;
  maxFileSize?: number;
  mute?: boolean;
  mirrorVideo?: boolean;
  path?: string;
  videoBitrate?: number;
  fps?: number;
  /** iOS only */
  codec?: keyof VideoCodec | VideoCodec[keyof VideoCodec];
}

const CameraCommands = codegenNativeCommands<CameraCommandsType>({
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
  ],
});

export const CAMERA_STATUS = {
  READY: 'READY',
  PENDING_AUTHORIZATION: 'PENDING_AUTHORIZATION',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
};

export const RecordAudioPermissionStatusEnum = {
  AUTHORIZED: 'AUTHORIZED',
  PENDING_AUTHORIZATION: 'PENDING_AUTHORIZATION',
  NOT_AUTHORIZED: 'NOT_AUTHORIZED',
};

interface CameraCommandsType {
  takePictureAsync(
    viewRef: React.ElementRef<CameraComponentType>,
    options?: TakePictureOptions,
  ): Promise<TakePictureResponse>;
  recordAsync(
    viewRef: React.ElementRef<CameraComponentType>,
    options?: RecordOptions,
  ): Promise<RecordResponse>;
  refreshAuthorizationStatus(viewRef: React.ElementRef<CameraComponentType>): Promise<void>;
  stopRecording(viewRef: React.ElementRef<CameraComponentType>): void;
  pausePreview(viewRef: React.ElementRef<CameraComponentType>): void;
  resumePreview(viewRef: React.ElementRef<CameraComponentType>): void;
  getSupportedRatiosAsync(viewRef: React.ElementRef<CameraComponentType>): Promise<string[]>;
  checkIfVideoIsValid(viewRef: React.ElementRef<CameraComponentType>): Promise<boolean>;
  getCameraIdsAsync: (viewRef: React.ElementRef<CameraComponentType>) => Promise<HardwareCamera[]>;
  isRecording: (viewRef: React.ElementRef<CameraComponentType>) => Promise<boolean>;
}

export interface CameraRefType extends Omit<CameraCommandsType, CameraCommands> {
  takePictureAsync(options?: TakePictureOptions): Promise<TakePictureResponse>;
  recordAsync(options?: RecordOptions): Promise<RecordResponse>;
  refreshAuthorizationStatus(): Promise<void>;
  stopRecording(): void;
  pausePreview(): void;
  resumePreview(): void;
  getSupportedRatiosAsync(): Promise<string[]>;
  checkIfVideoIsValid(): Promise<boolean>;
  getCameraIdsAsync: () => Promise<HardwareCamera[]>;
  isRecording: () => Promise<boolean>;
}
interface PermissionStatusType {
  cameraStatus?: string;
  recordAudioPermissionStatus?: string;
}

interface EventType {
  onSubjectAreaChanged?: (event: { nativeEvent: { prevPoint: { x: number; y: number } } }) => void;
  onCameraReady?(): void;
  onStatusChange?(event: PermissionStatusType): void;
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
  onBarCodeRead?(event: BarCodeReadEvent): void;
  onGoogleVisionBarcodesDetected?(event: GoogleVisionBarcodesDetectedEvent): void;
  onFacesDetected?(response: { faces: Face[] }): void;
  onFaceDetectionError?(response: { isOperational: boolean }): void;
  onTextRecognized?(response: { textBlocks: TrackedTextFeature[] }): void;
}

export interface CameraProps extends NativeProps, EventType {
  notAuthorizedView?: JSX.Element;
  pendingAuthorizationView?: JSX.Element;
}

const Camera = forwardRef<CameraRefType, CameraProps>(
  (
    {
      style,
      onStatusChange,
      onCameraReady,
      onMountError,
      onPictureTaken,
      onRecordingStart,
      onRecordingEnd,
      onAudioInterrupted,
      onAudioConnected,
      onTap,
      onDoubleTap,
      onBarCodeRead,
      onGoogleVisionBarcodesDetected,
      onFacesDetected,
      onFaceDetectionError,
      onTextRecognized,
      notAuthorizedView,
      pendingAuthorizationView,
      captureAudio,
      ...rest
    },
    ref,
  ) => {
    const CameraRef = useRef<React.ElementRef<CameraComponentType>>(null);
    const [cameraPermissionsStatus, setCameraPermissionsStatus] = useState<string>(
      CAMERA_STATUS.PENDING_AUTHORIZATION,
    );
    const [audioPermissionsStatus, setAudioPermissionsStatus] = useState<string>(
      RecordAudioPermissionStatusEnum.PENDING_AUTHORIZATION,
    );

    useEffect(() => {
      requestCameraPermissionsFn();
      return () => {};
    }, []);

    useEffect(() => {
      requestAudioPermissionsFn(captureAudio);
    }, [captureAudio]);

    const requestCameraPermissionsFn = async () => {
      let cameraStatus = CAMERA_STATUS.PENDING_AUTHORIZATION;
      const status = await NativeEvent?.requestDeviceCameraAuthorization();
      if (status) {
        cameraStatus = CAMERA_STATUS.READY;
      } else {
        cameraStatus = CAMERA_STATUS.NOT_AUTHORIZED;
      }
      setCameraPermissionsStatus(cameraStatus);
      onStatusChange?.({ recordAudioPermissionStatus: audioPermissionsStatus, cameraStatus });
    };

    const requestAudioPermissionsFn = async (audio: boolean | undefined) => {
      let recordAudioPermissionStatus = RecordAudioPermissionStatusEnum.PENDING_AUTHORIZATION;
      if (audio) {
        const status = await NativeEvent?.requestMicrophonePermission();
        if (status) {
          recordAudioPermissionStatus = RecordAudioPermissionStatusEnum.AUTHORIZED;
        } else {
          recordAudioPermissionStatus = RecordAudioPermissionStatusEnum.NOT_AUTHORIZED;
        }
        setAudioPermissionsStatus(recordAudioPermissionStatus);
        onStatusChange?.({ recordAudioPermissionStatus, cameraStatus: cameraPermissionsStatus });
      }
    };

    DeviceEventEmitter.addListener('onMountError', (error) => {
      onMountError?.(error);
    });

    DeviceEventEmitter.addListener('onPictureTaken', () => {
      onPictureTaken?.();
    });
    DeviceEventEmitter.addListener('onRecordingStart', (event) => {
      onRecordingStart?.(event);
    });
    DeviceEventEmitter.addListener('onRecordingEnd', () => {
      onRecordingEnd?.();
    });

    DeviceEventEmitter.addListener('onAudioInterrupted', () => {
      onAudioInterrupted?.();
    });

    DeviceEventEmitter.addListener('onTap', (origin) => {
      onTap?.(origin);
    });

    DeviceEventEmitter.addListener('onDoubleTap', (origin) => {
      onDoubleTap?.(origin);
    });

    DeviceEventEmitter.addListener('onBarCodeRead', (origin) => {
      onBarCodeRead?.(origin);
    });

    DeviceEventEmitter.addListener('onGoogleVisionBarcodesDetected', (event) => {
      onGoogleVisionBarcodesDetected?.(event);
    });

    DeviceEventEmitter.addListener('onFacesDetected', (response) => {
      onFacesDetected?.(response);
    });

    DeviceEventEmitter.addListener('onFaceDetectionError', (response) => {
      onFaceDetectionError?.(response);
    });
    DeviceEventEmitter.addListener('onTextRecognized', (response) => {
      onTextRecognized?.(response);
    });
    DeviceEventEmitter.addListener('onCameraReady', () => {
      onCameraReady?.();
    });

    const takePictureAsync = (options?: TakePictureOptions): Promise<TakePictureResponse> => {
      return new Promise((resolve) => {
        const onEventListener = DeviceEventEmitter.addListener(
          'takePictureAsync',
          (data: TakePictureResponse) => {
            resolve(data);
            onEventListener.remove();
          },
        );
        if (!CameraRef.current) throw new Error('CameraRef.current is NaN');
        CameraCommands.takePictureAsync(CameraRef.current, options);
      });
    };
    const recordAsync = (options?: RecordOptions): Promise<RecordResponse> => {
      return new Promise((resolve) => {
        const onEventListener = DeviceEventEmitter.addListener(
          'recordAsync',
          (data: RecordResponse) => {
            resolve(data);
            onEventListener.remove();
          },
        );
        if (!CameraRef.current) throw new Error('CameraRef.current is NaN');
        CameraCommands.recordAsync(CameraRef.current, options);
      });
    };

    const refreshAuthorizationStatus = (): Promise<void> => {
      return new Promise((resolve) => {
        const onEventListener = DeviceEventEmitter.addListener('refreshAuthorizationStatus', () => {
          resolve();
          onEventListener.remove();
        });
        if (!CameraRef.current) throw new Error('CameraRef.current is NaN');
        CameraCommands.recordAsync(CameraRef.current);
      });
    };

    const stopRecording = (): void => {
      if (!CameraRef.current) throw new Error('CameraRef.current is NaN');
      CameraCommands.stopRecording(CameraRef.current);
    };

    const pausePreview = (): void => {
      if (!CameraRef.current) throw new Error('CameraRef.current is NaN');
      CameraCommands.pausePreview(CameraRef.current);
    };

    const resumePreview = (): void => {
      if (!CameraRef.current) throw new Error('CameraRef.current is NaN');
      CameraCommands.resumePreview(CameraRef.current);
    };

    const getSupportedRatiosAsync = (): Promise<string[]> => {
      return new Promise((resolve) => {
        const onEventListener = DeviceEventEmitter.addListener(
          'getSupportedRatiosAsync',
          (data: string[]) => {
            resolve(data);
            onEventListener.remove();
          },
        );
        if (!CameraRef.current) throw new Error('CameraRef.current is NaN');
        CameraCommands.getSupportedRatiosAsync(CameraRef.current);
      });
    };

    const checkIfVideoIsValid = (): Promise<boolean> => {
      return new Promise((resolve) => {
        const onEventListener = DeviceEventEmitter.addListener(
          'checkIfVideoIsValid',
          (data: boolean) => {
            resolve(data);
            onEventListener.remove();
          },
        );
        if (!CameraRef.current) throw new Error('CameraRef.current is NaN');
        CameraCommands.checkIfVideoIsValid(CameraRef.current);
      });
    };

    const getCameraIdsAsync = (): Promise<HardwareCamera[]> => {
      return new Promise((resolve) => {
        const onEventListener = DeviceEventEmitter.addListener(
          'checkIfVideoIsValid',
          (data: HardwareCamera[]) => {
            resolve(data);
            onEventListener.remove();
          },
        );
        if (!CameraRef.current) throw new Error('CameraRef.current is NaN');
        CameraCommands.getCameraIdsAsync(CameraRef.current);
      });
    };

    const isRecording = (): Promise<boolean> => {
      return new Promise((resolve) => {
        const onEventListener = DeviceEventEmitter.addListener('isRecording', (data: boolean) => {
          resolve(data);
          onEventListener.remove();
        });
        if (!CameraRef.current) throw new Error('CameraRef.current is NaN');
        CameraCommands.isRecording(CameraRef.current);
      });
    };

    useImperativeHandle(ref, () => ({
      takePictureAsync,
      recordAsync,
      refreshAuthorizationStatus,
      stopRecording,
      pausePreview,
      resumePreview,
      getSupportedRatiosAsync,
      checkIfVideoIsValid,
      getCameraIdsAsync,
      isRecording,
    }));

    if (cameraPermissionsStatus === CAMERA_STATUS.NOT_AUTHORIZED && notAuthorizedView) {
      return notAuthorizedView;
    }
    if (
      cameraPermissionsStatus === CAMERA_STATUS.PENDING_AUTHORIZATION &&
      pendingAuthorizationView
    ) {
      return pendingAuthorizationView;
    }

    return (
      <View style={style}>
        <NativeVisionCameraView ref={CameraRef} style={StyleSheet.absoluteFill} {...rest} />
      </View>
    );
  },
);

export default Camera;
