/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import { photoAccessHelper } from '@kit.MediaLibraryKit';
import { camera } from '@kit.CameraKit';
import { media } from '@kit.MediaKit';
import { fileIo as fs } from '@kit.CoreFileKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { JSON } from '@kit.ArkTS';
import Logger from '../utils/Logger';
import { common, Context } from '@kit.AbilityKit';
import { RNOHContext } from '@rnoh/react-native-openharmony/ts';
import {
  AllPermissionStatus,
  CameraProps,
  RecordResponse,
  TakePictureResponse,
  TorchMode,
  ZoomMode
} from '../types';
import { isEmptyValue } from '../utils/utils';
import { CAMERA_STATUS, Constants, RecordAudioPermissionStatusEnum } from '../common/Constants';
import { RecordOptions, TakePictureOptions } from '../types';
import { getFlashMode, getFocusMode, getPhotoProfileList, getResolutionSize, getVideoCodec } from './utils';


const TAG: string = 'CameraService';

export class SliderValue {
  min: number = 1;
  max: number = 6;
  step: number = 0.1;
}

declare function getContext(component?: Object): Context;

class CameraService {
  private ctx?: RNOHContext;
  private phAccessHelper: photoAccessHelper.PhotoAccessHelper = undefined;
  private context: common.Context | undefined = getContext(this);
  private cameraManager: camera.CameraManager | undefined = undefined;
  private cameras: Array<camera.CameraDevice> | Array<camera.CameraDevice> = [];
  private cameraInput: camera.CameraInput | undefined = undefined;
  private previewOutput: camera.PreviewOutput | undefined = undefined;
  private photoOutput: camera.PhotoOutput | undefined = undefined;
  private videoOutput: camera.VideoOutput | undefined = undefined;
  private avRecorder: media.AVRecorder | undefined = undefined;
  private session: camera.PhotoSession | camera.VideoSession | undefined = undefined;
  private curSceneMode: camera.SceneMode = camera.SceneMode.NORMAL_PHOTO;
  private curCameraDevice: camera.CameraDevice | undefined = undefined;
  private photoAsset = {} as TakePictureResponse;
  private maxZoom: number | undefined = undefined;
  private zoomMode: ZoomMode = 'on';
  public photoPreviewScale: number = 1;
  private cameraDeviceIndex: number = 0;
  private surfaceId: string = '';
  private outPathArray: string[] = ['photo', 'video'];
  private basicPath: string = '';
  private videoUri: string;
  private videoFile: fs.File;
  private isRecording: boolean = false; //是否记录
  private props: CameraProps
  private allPermissionStatus: AllPermissionStatus = {
    cameraStatus: CAMERA_STATUS.PENDING_AUTHORIZATION,
    recordAudioPermissionStatus: RecordAudioPermissionStatusEnum.PENDING_AUTHORIZATION
  }
  private ratioList: string[] = ["16:9", "4:3"];


  private photoProfileObj: camera.Profile = {
    format: 2000,
    size: {
      width: 1920,
      height: 1080
    }
  };
  private previewProfileObj: camera.Profile = {
    format: 1003,
    size: {
      width: 1920,
      height: 1080
    }
  };
  private videoProfileObj: camera.VideoProfile = {
    format: 1003,
    size: {
      width: 1920,
      height: 1080
    },
    frameRateRange: {
      min: 30,
      max: 60
    }
  };

  // 相机拍照参数
  private photoCaptureSetting: camera.PhotoCaptureSetting = {
    rotation: camera.ImageRotation.ROTATION_0, // 图片旋转角度
    mirror: false, // 麦克风
    quality: camera.QualityLevel.QUALITY_LEVEL_MEDIUM, // 图片质量
  };
  rect = {
    surfaceWidth: 1216, surfaceHeight: 2224
  };


  constructor() {
    this.phAccessHelper = photoAccessHelper.getPhotoAccessHelper(this.context);
    this.basicPath = this.context.filesDir;
    for (let outPath of this.outPathArray) {
      this.initTempPath(outPath);
    }
  }

  public setProps(props) {
    this.props = props
  }

  public setSceneMode(sceneMode: camera.SceneMode): void {
    this.curSceneMode = sceneMode;
  }

  private initTempPath(path: string) {
    let pathDir = this.basicPath + '/' + path;
    let res;
    try {
      res = fs.accessSync(pathDir);
    } catch (error) {
      Logger.error(TAG, `constructor error path not exists:${JSON.stringify(error)}`);
    }
    if (!res) {
      Logger.error(TAG, `constructor photo path not exists:${pathDir}`);
      fs.mkdirSync(pathDir, true);
    }
  }

  /**
   * 获取可用设备
   */
  public getAvailableCameraDevices(): Array<camera.CameraDevice> {
    let camerasArray = this.cameraManager?.getSupportedCameras();
    if (!camerasArray) {
      Logger.error(TAG, 'getAvailableCameraDevices cannot get cameras');
      return;
    }
    return camerasArray;
  }

  public async initCamera(initConfig: { surfaceId: string, cameraDeviceIndex: number, cameraProps?: CameraProps, initSuccessCallBack?: () => void }
  ): Promise<void> {
    const { surfaceId, cameraDeviceIndex, cameraProps, initSuccessCallBack } = initConfig;
    Logger.debug(TAG, `initCamera cameraDeviceIndex: ${cameraDeviceIndex}`);
    this.surfaceId = surfaceId;
    this.cameraDeviceIndex = cameraDeviceIndex;
    try {
      await this.releaseCamera();
      this.cameraManager = this.getCameraManagerFn();
      if (this.cameraManager === undefined) {
        this.onError('cameraManager is undefined')
        return;
      }
      this.cameras = this.getSupportedCamerasFn(this.cameraManager);
      if (this.cameras.length < 1 || this.cameras.length < cameraDeviceIndex + 1) {
        this.onError('No camera equipment')
        return;
      }
      this.curCameraDevice = this.cameras[cameraDeviceIndex];
      let isSupported = this.isSupportedSceneMode(this.cameraManager, this.curCameraDevice);
      if (!isSupported) {
        this.onError('The current scene mode is not supported.')
        return;
      }
      let cameraOutputCapability =
        this.cameraManager.getSupportedOutputCapability(this.curCameraDevice, this.curSceneMode);
      let previewProfile = this.getPreviewProfile(cameraOutputCapability);
      if (previewProfile === undefined) {
        this.onError('The resolution of the current preview stream is not supported.')
        return;
      }
      this.previewProfileObj = previewProfile;
      this.previewOutput = this.createPreviewOutputFn(this.cameraManager, this.previewProfileObj, surfaceId);
      if (this.previewOutput === undefined) {
        this.onError('Failed to create the preview stream.')
        return;
      }
      this.previewOutputCallBack(this.previewOutput);

      //拍照模式
      if (this.curSceneMode === camera.SceneMode.NORMAL_PHOTO) {
        let photoProfile = this.getPhotoProfile(cameraOutputCapability);
        if (photoProfile === undefined) {
          this.onError('The resolution of the current photo stream is not supported.')
          return;
        }
        this.photoProfileObj = photoProfile;
        this.photoOutput = this.createPhotoOutputFn(this.cameraManager, this.photoProfileObj);
        if (this.photoOutput === undefined) {
          Logger.error(TAG, 'Failed to create the photo stream.');
          return;
        }
      }
      // 视频模式
      else if (this.curSceneMode === camera.SceneMode.NORMAL_VIDEO) {
        let videoProfile = this.getVideoProfile(cameraOutputCapability);
        if (videoProfile === undefined) {
          this.onError('The resolution of the current video stream is not supported.')
          return;
        }
        this.videoProfileObj = videoProfile;
        this.avRecorder = await this.createAVRecorder();
        if (this.avRecorder === undefined) {
          Logger.error(TAG, 'Failed to create the avRecorder.');
          return;
        }
        await this.prepareAVRecorder();
      }


      // 创建cameraInput输出对象
      this.cameraInput = this.createCameraInputFn(this.cameraManager, this.curCameraDevice);
      if (this.cameraInput === undefined) {
        Logger.error(TAG, 'Failed to create the camera input.');
        return;
      }
      // 打开相机
      let isOpenSuccess = await this.cameraInputOpenFn(this.cameraInput);
      if (!isOpenSuccess) {
        Logger.error(TAG, 'Failed to open the camera.');
        return;
      }
      // 监听相机状态变化
      this.onCameraStatusChange(this.cameraManager);
      // 监听CameraInput
      this.onCameraInputChange(this.cameraInput, this.curCameraDevice);
      // 会话流程
      await this.sessionFlowFn(this.cameraManager, this.cameraInput, this.previewOutput, this.photoOutput);

      initSuccessCallBack?.();
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `initCamera fail: ${JSON.stringify(err)}`);
      this.onError(`initCamera fail: ${JSON.stringify(err)}`)
    }
  }

  private async createAVRecorder(): Promise<media.AVRecorder | undefined> {
    let avRecorder: media.AVRecorder | undefined = undefined;
    try {
      avRecorder = await media.createAVRecorder();
    } catch (error) {
      Logger.error(TAG, `createAVRecorder error: ${error}`);
    }
    return avRecorder;
  }


  /*
   * 异步拍照
   * */
  public async takePictureAsync(options?: TakePictureOptions): Promise<TakePictureResponse> {
    if (!options) {
      options = {};
    }
    if (!options.quality) {
      options.quality = 1;
    }

    if (options.pauseAfterCapture === undefined) {
      options.pauseAfterCapture = false;
    }
    this.photoAsset.uri = '';
    await this.photoOutput?.capture(this.photoCaptureSetting);
    this.photoAsset.width = this.photoProfileObj.size.width;
    this.photoAsset.height = this.photoProfileObj.size.height;
    return new Promise((resolve) => {
      const timer = setInterval(() => {
        if (this.photoAsset.uri) {
          clearInterval(timer);
          resolve(this.photoAsset);
          Logger.info(TAG, `this.photoAsset res===${JSON.stringify(this.photoAsset)}`);
        }
      }, 200)
    });
  }


  public async recordAsync(options?: RecordOptions): Promise<RecordResponse> {
    return;
  }

  public async refreshAuthorizationStatus(): Promise<void> {
    return;
  }

  public async getAvailablePictureSizes(): Promise<string[]> {
    return;
  }

  public async getSupportedRatiosAsync(): Promise<string[]> {
    // return new Promise((resolve) => {
    //   const timer = setTimeout(() => {
    //     if (this.photoAsset.uri) {
    //       clearTimeout(timer);
    //       if (this.ctx) {
    //         this.ctx.rnInstance.emitDeviceEvent('getSupportedRatiosAsync', this.ratioList);
    //       }
    //       resolve(this.ratioList);
    //     }
    //   }, 200)
    // });
    if (this.ctx) {
      this.ctx.rnInstance.emitDeviceEvent('getSupportedRatiosAsync', this.ratioList);
    }
    return this.ratioList

  }

  public async getSupportedPreviewFpsRange(): Promise<string[]> {
    return;
  }

  public async checkIfVideoIsValid(): Promise<boolean> {
    return;
  }

  public async isRecordingFn(): Promise<boolean> {
    return
  }

  /*
   * 准备录制
   * */
  private async prepareAVRecorder(options?: RecordOptions): Promise<void> {
    const { quality, orientation, mute:_mute, fps, codec, path, videoBitrate } = options;
    let mute = _mute || false;
    this.videoUri = `${this.basicPath}/${this.outPathArray[1]}/${Date.now()}.${'mp4'}`;
    this.videoFile = fs.openSync(this.videoUri, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);

    const { captureAudio } = this.props;
    if (
      !captureAudio ||
        this.allPermissionStatus.recordAudioPermissionStatus !== RecordAudioPermissionStatusEnum.AUTHORIZED
    ) {
      mute = true;
    }

    let audioConfig = !mute ? {
      audioBitrate: Constants.AUDIO_BITRATE,
      audioChannels: Constants.AUDIO_CHANNELS,
      audioCodec: media.CodecMimeType.AUDIO_AAC,
      audioSampleRate: Constants.AUDIO_SAMPLE_RATE,
    } : {}

    const resolutionSize = getResolutionSize(quality);
    let videoConfig: media.AVRecorderConfig = {
      audioSourceType: media.AudioSourceType.AUDIO_SOURCE_TYPE_MIC,
      videoSourceType: media.VideoSourceType.VIDEO_SOURCE_TYPE_SURFACE_YUV,
      profile: {
        ...audioConfig,
        fileFormat: media.ContainerFormatType.CFT_MPEG_4,
        videoBitrate: videoBitrate ?? Constants.VIDEO_BITRATE,
        videoCodec: getVideoCodec(codec),
        videoFrameWidth: resolutionSize?.width ?? this.videoProfileObj.size.width,
        videoFrameHeight: resolutionSize?.height ?? this.videoProfileObj.size.height,
        videoFrameRate: fps ?? 30,
      },
      url: `fd://${this.videoFile.fd.toString()}`,
      rotation: this.curCameraDevice?.cameraOrientation,
    };
    Logger.info(TAG, `prepareAVRecorder videoConfig: ${JSON.stringify(videoConfig)}`);
    await this.avRecorder?.prepare(videoConfig).catch((err: BusinessError): void => {
      Logger.error(TAG, `prepareAVRecorder prepare err: ${JSON.stringify(err)}`);
    });
  }

  /*
   * 启动录制
   * */
  public async startVideo(): Promise<void> {
    Logger.info(TAG, 'startVideo is called');
    try {
      await this.videoOutput?.start();
      await this.avRecorder?.start();
      this.isRecording = true;
    } catch (error) {
      let err = error as BusinessError;
      this.onError(`startVideo err: ${JSON.stringify(err)}`)
    }
  }

  /*
   * 停止录制
   * */
  public async stopRecording(): Promise<void> {
    Logger.info(TAG, 'stopVideo is called');
    if (!this.isRecording) {
      Logger.info(TAG, 'not in recording');
      return;
    }
    try {
      if (this.avRecorder) {
        await this.avRecorder.stop();
      }
      if (this.videoOutput) {
        await this.videoOutput.stop();
      }
      this.isRecording = false;
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `stopVideo err: ${JSON.stringify(err)}`);
    }
    Logger.info(TAG, 'stopVideo End of call');
  }


  // 暂停录制
  public async resumePreview() {
    if (this.avRecorder.state === 'started') {
      await this.avRecorder.pause();
      this.videoOutput.stop((err: BusinessError) => {
        if (err) {
          Logger.error(TAG, `pauseRecording: Failed to stop the video output. error: ${JSON.stringify(err)}`);
          return;
        }
      });
    }
  }

  /**
   * 恢复录制
   */
  public async pausePreview() {
    if (this.avRecorder.state === 'paused') {
      await this.avRecorder.resume();
      this.videoOutput.start((err: BusinessError) => {
        if (err) {
          Logger.error(TAG, `resumeRecording: Failed to stop the video output. error: ${JSON.stringify(err)}`);
          return;
        }
      });
    }
  }

  public initProps(props: CameraProps): void {
    this.setProps(props);
    Logger.info(TAG, `CameraProps:${JSON.stringify(props)}`)
    const {
      torchMode,
      zoom,
      maxZoom,
      zoomMode,
      autoFocus,
      autoFocusPointOfInterest,
      flashMode:_flashMode,
      type:_type,
      exposure,
    } = props;
    const type = _type ?? 'back'
    const flashMode = getFlashMode(_flashMode)
    const focusMode = getFocusMode(autoFocus);

    if (!isEmptyValue(type)) {
      this.setCameraType(type);
    }
    if (!isEmptyValue(exposure)) {
      this.setExposure(exposure);
    }
    if (!isEmptyValue(autoFocus)) {
      this.setFocusModeFn(focusMode)
    }
    if (!isEmptyValue(autoFocusPointOfInterest)) {
      this.setFocusPoint(autoFocusPointOfInterest)
    }
    if (!isEmptyValue(flashMode)) {
      this.setFlashModeFn(flashMode)
    }
    if (!isEmptyValue(torchMode)) {
      this.setTorchFn(torchMode)
    }
    if (!isEmptyValue(zoom)) {
      this.setZoomRatioFn(zoom)
    }
    if (!isEmptyValue(maxZoom)) {
      this.maxZoom = maxZoom;
    }
    if (!isEmptyValue(zoomMode)) {
      this.zoomMode = zoomMode;
    }
  }

  setCameraType(cameraType) {
    let cameraIndex = 0;
    cameraType === 'front' ? cameraIndex = 1 : cameraIndex = 0;
    if (this.cameraDeviceIndex === cameraIndex) {
      return;
    }
    if (this.surfaceId) {
      this.cameraDeviceIndex = cameraIndex;
      this.initCamera({ surfaceId: this.surfaceId, cameraDeviceIndex: cameraIndex })
    }
  }

  setCtx(ctx: RNOHContext) {
    this.ctx = ctx;
  }


  getPhotoAsset() {
    return this.photoAsset;
  }


  getPreviewProfile(cameraOutputCapability: camera.CameraOutputCapability): camera.Profile | undefined {
    let previewProfiles = cameraOutputCapability.previewProfiles;
    if (previewProfiles.length < 1) {
      return undefined;
    }
    let index = previewProfiles.findIndex((previewProfile: camera.Profile) => {
      return previewProfile.size.width === this.previewProfileObj.size.width &&
        previewProfile.size.height === this.previewProfileObj.size.height &&
        previewProfile.format === this.previewProfileObj.format;
    });
    if (index === -1) {
      return previewProfiles[0];
    }
    return previewProfiles[index];
  }


  getPhotoProfile(cameraOutputCapability: camera.CameraOutputCapability): camera.Profile | undefined {
    let photoProfiles = cameraOutputCapability.photoProfiles;
    if (photoProfiles.length < 1) {
      return undefined;
    }
    let ratio = this.props.ratio ?? '16:9';
    let list = getPhotoProfileList(photoProfiles);
    if (list.length) {
      this.ratioList = [...new Set(list.map(item => item.ratio))]
    }
    const filterList = list.filter(item => item.ratio === ratio);
    if (filterList.length) {
      const result = filterList[0] as camera.Profile
      this.photoProfileObj = result
      return result
    } else {
      return photoProfiles[0];
    }
  }

  getVideoProfile(cameraOutputCapability: camera.CameraOutputCapability): camera.VideoProfile | undefined {
    let videoProfiles = cameraOutputCapability.videoProfiles;
    if (videoProfiles.length < 1) {
      return undefined;
    }
    let index = videoProfiles.findIndex((videoProfile: camera.VideoProfile) => {
      return videoProfile.size.width === this.videoProfileObj.size.width &&
        videoProfile.size.height === this.videoProfileObj.size.height &&
        videoProfile.format === this.videoProfileObj.format &&
        videoProfile.frameRateRange.min <= Constants.MAX_VIDEO_FRAME &&
        videoProfile.frameRateRange.max <= Constants.MAX_VIDEO_FRAME;
    });
    if (index === -1) {
      return videoProfiles[0];
    }
    return videoProfiles[index];
  }


  // 获取支持的模式类型
  isSupportedSceneMode(cameraManager: camera.CameraManager, cameraDevice: camera.CameraDevice): boolean {
    let sceneModes = cameraManager.getSupportedSceneModes(cameraDevice);
    if (sceneModes === undefined) {
      return false;
    }
    let index = sceneModes.findIndex((sceneMode: camera.SceneMode) => {
      return sceneMode === this.curSceneMode;
    });
    if (index === -1) {
      return false;
    }
    return true;
  }


  /**
   * 获取可变焦距范围
   */
  getZoomRatioRange(): Array<number> {
    let zoomRatioRange: Array<number> = [];
    if (this.session !== undefined) {
      zoomRatioRange = this.session.getZoomRatioRange();
    }
    return zoomRatioRange;
  }

  getZoomRatioFn(): number {
    const invalidValue: number = -1;
    let zoomRatio: number = invalidValue;
    try {
      if (this.session) {
        zoomRatio = this.session.getZoomRatio();
      }
    } catch (error) {
      // 失败返回错误码error.code并处理
      let err = error as BusinessError;
      Logger.error(TAG, `The getZoomRatio call failed. error code: ${err.code}`);
      this.onError(`The getZoomRatio call failed. error code: ${err.code}`)
    }
    return zoomRatio;
  }

  /**
   * 变焦
   */
  setZoomRatioFn(zoom: number): void {
    Logger.info(TAG, `setSmoothZoom: ${zoom}`)
    if (this.zoomMode === 'off') {
      return;
    }
    const currentZoom = this.session?.getZoomRatio();
    if (currentZoom === zoom) {
      return;
    }
    try {
      const zoomRatioRange = this.getZoomRatioRange();
      Logger.info(TAG, `zoomRatioRange,${JSON.stringify(zoomRatioRange)}`);
      const min = zoomRatioRange[0]
      let max = zoomRatioRange[1];
      if (this.maxZoom && this.maxZoom <= max) {
        max = this.maxZoom;
      }
      if (zoom <= min) {
        zoom = min;
      } else if (zoom >= max) {
        zoom = max;
      }

      this.session?.setZoomRatio(zoom);
      this.onZoom(zoom);
      Logger.info(TAG, 'setSmoothZoom success.');
    } catch (error) {
      Logger.error(TAG, `The setSmoothZoom call failed. error code: ${error.code}.`);
      this.onError(`The setSmoothZoom call failed. error code: ${error.code}.`)
    }
  }


  /**
   * 释放会话及其相关参数
   */
  async releaseCamera(): Promise<void> {
    Logger.info(TAG, 'releaseCamera is called');
    // release photo
    try {
      await this.previewOutput?.release();
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `previewOutput release fail: error: ${JSON.stringify(err)}`);
      this.onError(`previewOutput release fail: error: ${JSON.stringify(err)}`)
    } finally {
      this.previewOutput = undefined;
    }
    try {
      await this.photoOutput?.release();
    } catch (error) {
      let err = error as BusinessError;
      const log = `photoOutput release fail: error: ${JSON.stringify(err)}`
      Logger.error(TAG, log);
      this.onError(log)
    } finally {
      this.photoOutput = undefined;
    }

    try {
      await this.session?.release();
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `captureSession release fail: error: ${JSON.stringify(err)}`);
    } finally {
      this.session = undefined;
    }
    try {
      await this.cameraInput?.close();
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `cameraInput close fail: error: ${JSON.stringify(err)}`);
    } finally {
      this.cameraInput = undefined;
    }
    this.offCameraStatusChange();
    Logger.info(TAG, 'releaseCamera success');
  }

  /**
   * 获取相机管理器实例
   */
  getCameraManagerFn(): camera.CameraManager | undefined {
    if (this.cameraManager) {
      return this.cameraManager;
    }
    let cameraManager: camera.CameraManager | undefined = undefined;
    try {
      cameraManager = camera.getCameraManager(this.context);
      Logger.info(TAG, `getCameraManager success: ${cameraManager}`);
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `getCameraManager failed: ${JSON.stringify(err)}`);
      this.onError(`getCameraManager failed: ${JSON.stringify(err)}`)
    }
    return cameraManager;
  }

  /**
   * 获取支持指定的相机设备对象
   */
  getSupportedCamerasFn(cameraManager: camera.CameraManager): Array<camera.CameraDevice> {
    let supportedCameras: Array<camera.CameraDevice> = [];
    try {
      supportedCameras = cameraManager.getSupportedCameras();
      Logger.info(TAG, `getSupportedCameras success: ${this.cameras}, length: ${this.cameras?.length}`);
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `getSupportedCameras failed: ${JSON.stringify(err)}`);
    }
    return supportedCameras;
  }

  /**
   * 创建previewOutput输出对象
   */
  createPreviewOutputFn(cameraManager: camera.CameraManager, previewProfileObj: camera.Profile,
    surfaceId: string): camera.PreviewOutput | undefined {
    let previewOutput: camera.PreviewOutput | undefined = undefined;
    try {
      previewOutput = cameraManager.createPreviewOutput(previewProfileObj, surfaceId);
      Logger.info(TAG, `createPreviewOutput success: ${previewOutput}`);
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `createPreviewOutput failed: ${JSON.stringify(err)}`);
    }
    return previewOutput;
  }

  /**
   * 创建photoOutPut输出对象
   */
  createPhotoOutputFn(cameraManager: camera.CameraManager,
    photoProfileObj: camera.Profile): camera.PhotoOutput | undefined {
    let photoOutput: camera.PhotoOutput | undefined = undefined;
    try {
      photoOutput = cameraManager.createPhotoOutput(photoProfileObj);
      Logger.info(TAG, `createPhotoOutputFn success: ${photoOutput}`);
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `createPhotoOutputFn failed: ${JSON.stringify(err)}`);
    }
    return photoOutput;
  }

  /**
   * 创建cameraInput输出对象
   */
  createCameraInputFn(cameraManager: camera.CameraManager,
    cameraDevice: camera.CameraDevice): camera.CameraInput | undefined {
    Logger.info(TAG, 'createCameraInputFn is called.');
    let cameraInput: camera.CameraInput | undefined = undefined;
    try {
      cameraInput = cameraManager.createCameraInput(cameraDevice);
      Logger.info(TAG, 'createCameraInputFn success');
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `createCameraInputFn failed: ${JSON.stringify(err)}`);
    }
    return cameraInput;
  }

  /**
   * 打开相机
   */
  async cameraInputOpenFn(cameraInput: camera.CameraInput): Promise<boolean> {
    let isOpenSuccess = false;
    try {
      await cameraInput.open();
      isOpenSuccess = true;
      Logger.info(TAG, 'cameraInput open success');
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `createCameraInput failed : ${JSON.stringify(err)}`);
    }
    return isOpenSuccess;
  }

  /**
   * 会话流程
   */
  async sessionFlowFn(cameraManager: camera.CameraManager, cameraInput: camera.CameraInput,
    previewOutput: camera.PreviewOutput, photoOutput: camera.PhotoOutput | undefined,
  ): Promise<void> {
    try {
      // 创建CaptureSession实例
      if (this.curSceneMode === camera.SceneMode.NORMAL_PHOTO) {
        this.session = cameraManager.createSession(this.curSceneMode) as camera.PhotoSession;
      } else if (this.curSceneMode === camera.SceneMode.NORMAL_VIDEO) {
        this.session = cameraManager.createSession(this.curSceneMode) as camera.VideoSession;
      }

      if (this.session === undefined) {
        return;
      }
      this.onSessionErrorChange(this.session);
      this.session.beginConfig();
      this.session.addInput(cameraInput);
      this.session.addOutput(previewOutput);
      if (photoOutput === undefined) {
        return;
      }
      // 拍照监听事件
      this.photoOutputCallBack(photoOutput);
      this.session.addOutput(photoOutput);
      // 提交配置信息
      await this.session.commitConfig();
      this.setFocusModeFn(camera.FocusMode.FOCUS_MODE_AUTO);
      await this.session.start();
      Logger.info(TAG, 'sessionFlowFn success-创建会话成功');
    } catch (error) {
      let err = error as BusinessError;
      Logger.error(TAG, `sessionFlowFn fail创建会话失败 : ${JSON.stringify(err)}`);
    }
  }

  // 通过弹窗获取需要保存到媒体库的位于应用沙箱的图片/视频uri
  async getMediaLibraryUri(srcFileUri: string, title: string, fileNameExtension: string,
    photoType: photoAccessHelper.PhotoType): Promise<string> {
    try {
      let srcFileUris: Array<string> = [
      // 应用沙箱的图片/视频uri
        srcFileUri
      ];
      let photoCreationConfigs: Array<photoAccessHelper.PhotoCreationConfig> = [
        {
          title: title,
          fileNameExtension: fileNameExtension,
          photoType: photoType,
          subtype: photoAccessHelper.PhotoSubtype.DEFAULT,
        }
      ];
      const desFileUris: Array<string> =
        await this.phAccessHelper.showAssetsCreationDialog(srcFileUris, photoCreationConfigs);
      Logger.info(TAG, `showAssetsCreationDialog success, data is:${desFileUris}`);
      return desFileUris[0];
    } catch (err) {
      Logger.error(TAG, `showAssetsCreationDialog failed, errCode is:${err.code},errMsg is:${err.message}`);
    }
  }

  /*
 * 保存照片
 * */
  async savePicture(photoAccess: photoAccessHelper.PhotoAsset): Promise<void> {
    let photoFile = `${this.basicPath}/${this.outPathArray[0]}/${Date.now().toString()}.jpeg`;
    let file = fs.openSync(photoAccess.uri, fs.OpenMode.READ_ONLY);
    let stat = fs.statSync(file.fd);
    let buffer = new ArrayBuffer(stat.size);
    fs.readSync(file.fd, buffer);
    fs.fsyncSync(file.fd);
    fs.closeSync(file);
    let _file;
    try {
      _file = fs.openSync(photoFile, fs.OpenMode.READ_WRITE | fs.OpenMode.CREATE);
      await fs.write(_file.fd, buffer);
    } catch (error) {
      Logger.error(TAG, `savePicture statSync failed,code:${error}.`);
    }
    fs.closeSync(_file);
    Logger.info(TAG, `photoFile:${JSON.stringify(photoFile)}`);
    this.photoAsset.uri = photoFile;
  }

  /**
   * 监听拍照事件
   */
  photoOutputCallBack(photoOutput: camera.PhotoOutput): void {
    try {
      // 监听拍照开始
      photoOutput.on('captureStartWithInfo', (err: BusinessError, captureStartInfo: camera.CaptureStartInfo): void => {
        Logger.info(TAG, `photoOutputCallBack captureStartWithInfo success: ${JSON.stringify(captureStartInfo)}`);
      });
      // 监听拍照帧输出捕获
      photoOutput.on('frameShutter', (err: BusinessError, frameShutterInfo: camera.FrameShutterInfo): void => {
        Logger.info(TAG, `photoOutputCallBack frameShutter captureId:
          ${frameShutterInfo.captureId}, timestamp: ${frameShutterInfo.timestamp}`);
      });
      // 监听拍照结束
      photoOutput.on('captureEnd', (err: BusinessError, captureEndInfo: camera.CaptureEndInfo): void => {
        Logger.info(TAG, `photoOutputCallBack captureEnd captureId:
          ${captureEndInfo.captureId}, frameCount: ${captureEndInfo.frameCount}`);
      });
      // 监听拍照异常
      photoOutput.on('error', (data: BusinessError): void => {
        Logger.info(TAG, `photoOutPut data: ${JSON.stringify(data)}`);
      });
      photoOutput.on('photoAssetAvailable', (err: BusinessError, photoAsset: photoAccessHelper.PhotoAsset) => {
        Logger.info(TAG, 'photoAssetAvailable begin');
        if (photoAsset === undefined) {
          Logger.error(TAG, 'photoAsset is undefined');
          return;
        }
        this.savePicture(photoAsset);
      });
    } catch (err) {
      Logger.error(TAG, 'photoOutputCallBack error');
    }
  }

  /**
   * 监听预览事件
   */
  previewOutputCallBack(previewOutput: camera.PreviewOutput): void {
    Logger.info(TAG, 'previewOutputCallBack is called');
    try {
      previewOutput.on('frameStart', (): void => {
        Logger.debug(TAG, 'Preview frame started');
      });
      previewOutput.on('frameEnd', (): void => {
        Logger.debug(TAG, 'Preview frame ended');
      });
      previewOutput.on('error', (previewOutputError: BusinessError): void => {
        Logger.info(TAG, `Preview output previewOutputError: ${JSON.stringify(previewOutputError)}`);
      });
    } catch (err) {
      Logger.error(TAG, 'previewOutputCallBack error');
    }
  }

  registerCameraStatusChange(err: BusinessError, cameraStatusInfo: camera.CameraStatusInfo): void {
    Logger.info(TAG, `cameraId: ${cameraStatusInfo.camera.cameraId},status: ${cameraStatusInfo.status}`);
  }

  /**
   * 监听相机状态变化
   */
  onCameraStatusChange(cameraManager: camera.CameraManager): void {
    Logger.info(TAG, 'onCameraStatusChange is called');
    try {
      cameraManager.on('cameraStatus', this.registerCameraStatusChange);
    } catch (error) {
      Logger.error(TAG, 'onCameraStatusChange error');
    }
  }

  /**
   * 停止监听相机状态变化
   */
  offCameraStatusChange(): void {
    Logger.info(TAG, 'offCameraStatusChange is called');
    this.cameraManager?.off('cameraStatus', this.registerCameraStatusChange);
  }

  /**
   * 监听相机输入变化
   */
  onCameraInputChange(cameraInput: camera.CameraInput, cameraDevice: camera.CameraDevice): void {
    Logger.info(TAG, `onCameraInputChange is called`);
    try {
      cameraInput.on('error', cameraDevice, (cameraInputError: BusinessError): void => {
        Logger.info(TAG, `onCameraInputChange cameraInput error code: ${cameraInputError.code}`);
      });
    } catch (error) {
      Logger.error(TAG, 'onCameraInputChange error');
    }
  }

  /**
   * 监听捕获会话错误变化
   * @param session - 相机捕获会话对象
   * @returns 无返回值
   */
  onSessionErrorChange(session: camera.PhotoSession): void {
    try {
      session.on('error', (captureSessionError: BusinessError): void => {
        Logger.info(TAG,
          'onCaptureSessionErrorChange captureSession fail: ' + JSON.stringify(captureSessionError.code));
      });
    } catch (error) {
      Logger.error(TAG, 'onCaptureSessionErrorChange error');
    }
  }


  /**
   * 闪关灯
   */
  setFlashModeFn(flashMode: camera.FlashMode): void {
    // 检测是否有闪关灯
    let hasFlash = this.session?.hasFlash();
    Logger.info(TAG, `hasFlash success, hasFlash: ${hasFlash}`);
    // 检测闪光灯模式是否支持
    let isFlashModeSupported = this.session?.isFlashModeSupported(flashMode);
    Logger.info(TAG, `isFlashModeSupported success, isFlashModeSupported: ${isFlashModeSupported}`);
    // 设置闪光灯模式
    const currentFlashMode = this.session?.getFlashMode();
    if (currentFlashMode === flashMode) {
      return
    }
    this.session?.setFlashMode(flashMode);
  }

  /**
   * 焦点
   */
  setFocusPoint(point: camera.Point): void {
    // 设置焦点
    this.session?.setFocusPoint(point);
    Logger.info(TAG, `setFocusPoint success point: ${JSON.stringify(point)}`);
    // 获取当前的焦点
    let nowPoint: camera.Point | undefined = undefined;
    nowPoint = this.session?.getFocusPoint();
    if (nowPoint === point) {
      return;
    }
    Logger.info(TAG, `getFocusPoint success, nowPoint: ${JSON.stringify(nowPoint)}`);
  }

  /**
   * 曝光区域
   */
  isMeteringPoint(point: camera.Point): void {
    // 获取当前曝光模式
    let exposureMode: camera.ExposureMode | undefined = undefined;
    exposureMode = this.session?.getExposureMode();
    Logger.info(TAG, `getExposureMode success, exposureMode: ${exposureMode}`);
    this.session?.setMeteringPoint(point);
    let exposurePoint: camera.Point | undefined = undefined;
    exposurePoint = this.session?.getMeteringPoint();
    Logger.info(TAG, `getMeteringPoint exposurePoint: ${JSON.stringify(exposurePoint)}`);
  }

  //设置手电筒模式
  setTorchFn(mode: TorchMode): void {
    Logger.info(TAG, `setTorch: ${mode}`)
    try {
      if (mode === 'on') {
        this.setFlashModeFn(camera.FlashMode.FLASH_MODE_ALWAYS_OPEN)
      } else {
        this.setFlashModeFn(camera.FlashMode.FLASH_MODE_CLOSE)
      }
    } catch (error) {
      Logger.error(TAG, `The setTorch call failed. error code: ${error.code}.`);
      this.onError(`The setTorch call failed. error code: ${error.code}.`)
    }
  }

  /**
   * 曝光补偿
   */
  setExposure(exposureBias: number): void {
    Logger.debug(TAG, `setExposureBias value ${exposureBias}`);
    // 查询曝光补偿范围
    let exposure = exposureBias
    const result = this.session?.getExposureBiasRange();
    // if (exposureBias > max) {
    //   exposure = max
    // } else if (exposureBias < min) {
    //   exposure = min;
    // }
    // // 设置曝光补偿
    // this.session?.setExposureBias(exposure);
  }

  /**
   * 对焦模式
   */
  setFocusModeFn(focusMode: camera.FocusMode): void {
    // 检测对焦模式是否支持
    Logger.info(TAG, `setFocusMode is called`);
    let isSupported = this.session?.isFocusModeSupported(focusMode);
    Logger.info(TAG, `setFocusMode isSupported: ${isSupported}`);
    // 设置对焦模式
    if (!isSupported) {
      return;
    }
    const currentFocusMode = this.session?.getFocusMode();
    if (currentFocusMode === focusMode) {
      return;
    }
    this.session?.setFocusMode(focusMode);
  }

  onZoom(zoom: number) {
    Logger.info(TAG, `emitDeviceEvent onZoom`)
    if (this.ctx) {
      this.ctx.rnInstance?.emitDeviceEvent('onZoom', {
        nativeEvent: {
          zoom: zoom
        }
      });
    }
  }

  onError(message: string) {
    if (this.ctx) {
      this.ctx.rnInstance.emitDeviceEvent('onMountError', { message: message });
    }
  }
}

export default new CameraService();