/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import type { TurboModule } from 'react-native/Libraries/TurboModule/RCTExport';
import { TurboModuleRegistry } from 'react-native';

interface TakePictureOptions {
  quality?: number;
  // orientation?: string | number;
  base64?: boolean;
  exif?: boolean;
  width?: number;
  mirrorImage?: boolean;
  doNotSave?: boolean;
  pauseAfterCapture?: boolean;
  // writeExif?: boolean | { [name: string]: any };
  /** Android only */
  fixOrientation?: boolean;
  /** iOS only */
  forceUpOrientation?: boolean;
  imageType?: string;
  path?: string;
}
interface TakePictureResponse {
  width: number;
  height: number;
  uri: string;
  base64?: string;
  // exif?: { [name: string]: any };
  pictureOrientation: number;
  deviceOrientation: number;
}

interface RecordOptions {
  quality?: string;
  orientation?: string | number;
  maxDuration?: number;
  maxFileSize?: number;
  mute?: boolean;
  mirrorVideo?: boolean;
  path?: string;
  videoBitrate?: number;

  /** iOS only */
  codec?: string;
  fps?: number;
}

interface RecordResponse {
  /** Path to the video saved on your app's cache directory. */
  uri: string;
  videoOrientation: number;
  deviceOrientation: number;
  isRecordingInterrupted: boolean;
  /** iOS only */
  codec?: string;
}
interface HardwareCamera {
  /** (iOS only) e.g: 'AVCaptureDeviceTypeBuiltInWideAngleCamera', 'AVCaptureDeviceTypeBuiltInUltraWideCamera' */
  deviceType?: string;
  id: string;
  type: number;
}

export interface Spec extends TurboModule {
  requestDeviceCameraAuthorization(): Promise<boolean>;
  checkDeviceCameraAuthorizationStatus(): boolean;
  checkMicrophoneAccessStatus(): boolean;
  requestMicrophonePermission: () => Promise<boolean>;
  getAvailableCameraDevices: () => Array<{
    cameraId: string;
    cameraPosition: string;
    cameraType: number;
  }>;
  getCameraIds: () => Array<HardwareCamera>;
  takePictureAsync: (options?: TakePictureOptions) => Promise<TakePictureResponse>;
  recordAsync(options?: RecordOptions): Promise<RecordResponse>;
  refreshAuthorizationStatus(): Promise<void>;
  stopRecording(): void;
  pausePreview(): void;
  resumePreview(): void;
  getAvailablePictureSizes(): Promise<string[]>;
  getCameraIdsAsync(): Promise<HardwareCamera[]>;
  /** Android only */
  getSupportedRatiosAsync(): Promise<string[]>;
  getSupportedPreviewFpsRange(): Promise<string[]>;
  checkIfVideoIsValid(): Promise<boolean>;
  /** iOS only */
  isRecording(): Promise<boolean>;
}

export default TurboModuleRegistry.get<Spec>('RTNCamera') as Spec;
