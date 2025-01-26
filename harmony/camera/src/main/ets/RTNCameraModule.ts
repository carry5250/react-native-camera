import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { RTNCameraTurboModule } from './types/RTNCameraTurboModule'
import CameraManager from './service/CameraManager';

export class RNCameraModule extends TurboModule implements RTNCameraTurboModule.Spec {
  getAvailableCameraDevices(): { cameraId: string; cameraPosition: string; cameraType: number; }[] {
    return CameraManager.getAvailableCameraDevices()
  }

  getCameraIds(): RTNCameraTurboModule.HardwareCamera[] {
    return CameraManager.getCameraIds()
  }

  takePictureAsync(options: RTNCameraTurboModule.TakePictureOptions): Promise<RTNCameraTurboModule.TakePictureResponse> {
    return CameraManager.takePictureAsync(options)
  }

  recordAsync(options: RTNCameraTurboModule.RecordOptions): Promise<RTNCameraTurboModule.RecordResponse> {
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

  getCameraIdsAsync(): Promise<RTNCameraTurboModule.HardwareCamera[]> {
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