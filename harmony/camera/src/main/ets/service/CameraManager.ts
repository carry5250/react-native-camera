/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import PermissionUtils from '../utils/PermissionUtils'
import { Constants } from '../common/Constants';
import Logger from '../utils/Logger'
import CameraService from './CameraService';
import { HardwareCamera, RecordOptions, RecordResponse, TakePictureOptions, TakePictureResponse } from '../types';


/*
 * 相机管理器
 * */

const TAG: string = 'CameraManager';

class CameraManager {
  constructor() {
  }

  /*
   * 检查相机权限
   * */
  checkDeviceCameraAuthorizationStatus(): boolean {
    let status = false;
    Logger.info(TAG, 'checkDeviceCameraAuthorizationStatus')
    try {
      status = PermissionUtils.checkPermission(Constants.CAMERA_PERMISSION);
      Logger.info(TAG, `checkDeviceCameraAuthorizationStatus-success`)
    } catch (error) {
      Logger.error(TAG, `checkDeviceCameraAuthorizationStatus-fail：${JSON.stringify(error)}`)
    }
    return status;
  }

  /*
   * 请求设备摄像头授权
   * */
  async requestDeviceCameraAuthorization() {
    let status = false;
    Logger.info(TAG, 'requestDeviceCameraAuthorization')
    try {
      status = await PermissionUtils.grantPermission([Constants.CAMERA_PERMISSION]);
    } catch (error) {
      Logger.error(TAG, `requestDeviceCameraAuthorization-fail：${JSON.stringify(error)}`)
    }
    return status
  }

  /*
 * 请求设备麦克风权限
 * */
  async requestMicrophoneAccess() {
    let status = false;
    try {
      status = await PermissionUtils.grantPermission([Constants.MICROPHONE_PERMISSION]);
    } catch (error) {
      Logger.error(TAG, `requestDeviceCameraAuthorization-fail：${JSON.stringify(error)}`)
    }
    return status
  }

  /*
   * 检查麦克风权限
   * */
  checkMicrophoneAccessStatus(): boolean {
    let status = false;
    Logger.info(TAG, 'checkDeviceCameraAuthorizationStatus')
    try {
      status = PermissionUtils.checkPermission(Constants.CAMERA_PERMISSION);
      Logger.info(TAG, `checkDeviceCameraAuthorizationStatus-success`)
    } catch (error) {
      Logger.error(TAG, `checkDeviceCameraAuthorizationStatus-fail：${JSON.stringify(error)}`)
    }
    return status;
  }

  /*
 * 获取所有相机设备
 * */
  getAvailableCameraDevices(): Array<{ cameraId: string; cameraPosition: string; cameraType: number }> {
    const list = CameraService.getAvailableCameraDevices()
    return list.map(item => {
      return {
        cameraId: item?.cameraId,
        cameraPosition: item?.cameraPosition === 0 ? "back" : 'front',
        cameraType: item?.cameraType
      }
    })

  }

  getCameraIds(): Array<{ id: string, deviceType: string, type: number }> {
    const list = CameraService.getAvailableCameraDevices();
    return list.map(item => {
      const { cameraPosition, cameraType } = item;
      return {
        ...item,
        id: item.cameraId,
        deviceType: cameraPosition === 0 ? 'back' : "front",
        type: cameraType
      }
    })
  }

  async takePictureAsync(options: TakePictureOptions): Promise<TakePictureResponse> {
    const result = await CameraService.takePictureAsync(options);
    return result;
  }

  async recordAsync(options: RecordOptions): Promise<RecordResponse> {
    const result = await CameraService.recordAsync(options);
    return result;
  }

  async refreshAuthorizationStatus(): Promise<void> {
   await this.requestDeviceCameraAuthorization()
  }

  stopRecording(): void {
    CameraService.stopRecording();
  }

  pausePreview(): void {
    CameraService.pausePreview();
  }

  resumePreview(): void {
    CameraService.resumePreview();
  }

  async getAvailablePictureSizes(): Promise<string[]> {
    const result = await CameraService.getAvailablePictureSizes();
    return result;
  }

  getCameraIdsAsync(): Promise<HardwareCamera[]> {
    return new Promise((resolve, reject) => {
      const ids = this.getCameraIds();
      resolve(ids)
    })
  }

  async getSupportedRatiosAsync(): Promise<string[]> {
    const result = await CameraService.getSupportedRatiosAsync();
    return result
  }

  async getSupportedPreviewFpsRange(): Promise<string[]> {
    const result = await CameraService.getSupportedPreviewFpsRange();
    return result
  }

  async checkIfVideoIsValid(): Promise<boolean> {
    const result = await CameraService.checkIfVideoIsValid();
    return result
  }

  async isRecording(): Promise<boolean> {
    const result = await CameraService.isRecordingFn();
    return result
  }
}

export default new CameraManager();