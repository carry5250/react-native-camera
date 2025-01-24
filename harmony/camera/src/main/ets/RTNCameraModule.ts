import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { TM } from "@rnoh/react-native-openharmony/generated/ts"
import CameraManager from './service/CameraManager';

export class RTNCameraModule extends TurboModule implements TM.RTNCamera.Spec {
  getAvailableCameraDevices(): { cameraId: string; cameraPosition: string; cameraType: number; }[] {
    return CameraManager.getAvailableCameraDevices()
  }

  getCameraIds(): TM.RTNCamera.HardwareCamera[] {
    return CameraManager.getCameraIds()
  }

  takePictureAsync(options: TM.RTNCamera.TakePictureOptions): Promise<TM.RTNCamera.TakePictureResponse> {
    return CameraManager.takePictureAsync(options)
  }

  recordAsync(options: TM.RTNCamera.RecordOptions): Promise<TM.RTNCamera.RecordResponse> {
    return CameraManager.recordAsync(options)
  }

  refreshAuthorizationStatus(): Promise<void> {
    return CameraManager.refreshAuthorizationStatus()
  }

  stopRecording(): void {
    return CameraManager.stopRecording()
  }

  pausePreview(): void {
    return CameraManager.pausePreview()
  }

  resumePreview(): void {
    return CameraManager.resumePreview()
  }

  getAvailablePictureSizes(): Promise<string[]> {
    return CameraManager.getAvailablePictureSizes()
  }

  getCameraIdsAsync(): Promise<TM.RTNCamera.HardwareCamera[]> {
    return CameraManager.getCameraIdsAsync()
  }

  getSupportedRatiosAsync(): Promise<string[]> {
    return CameraManager.getSupportedRatiosAsync()
  }

  getSupportedPreviewFpsRange(): Promise<string[]> {
    return CameraManager.getSupportedPreviewFpsRange()
  }

  checkIfVideoIsValid(): Promise<boolean> {
    return CameraManager.checkIfVideoIsValid()
  }

  isRecording(): Promise<boolean> {
    return CameraManager.isRecording()
  }

  checkMicrophoneAccessStatus(): boolean {
    return CameraManager.checkMicrophoneAccessStatus()
  }

  requestMicrophonePermission(): Promise<boolean> {
    return CameraManager.requestMicrophoneAccess()
  }

  requestDeviceCameraAuthorization(): Promise<boolean> {
    return CameraManager.requestDeviceCameraAuthorization();
  }

  checkDeviceCameraAuthorizationStatus(): boolean {
    return CameraManager.checkDeviceCameraAuthorizationStatus();
  }
}