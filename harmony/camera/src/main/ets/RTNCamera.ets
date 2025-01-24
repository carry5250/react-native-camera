/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */


import { RNComponentContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { camera } from '@kit.CameraKit';
import { scanBarcode, scanCore } from '@kit.ScanKit';
import { RNC } from "./generated"
import { abilityAccessCtrl, common } from '@kit.AbilityKit';
import Logger from './utils/Logger';
import { display } from '@kit.ArkUI';
import { CAMERA_STATUS, Constants, RecordAudioPermissionStatusEnum } from './common/Constants';
import CameraService from './service/CameraService'
import ScanService from './service/ScanService';
import { FocusAreaComponent, } from './component';
import { CameraProps, AllPermissionStatus, TakePictureOptions } from './types'
import { FocusComponent } from './component/FocusComponent';
import CameraManager from './service/CameraManager';
import { isEmptyValue } from './utils/utils';
import { window } from '@kit.ArkUI';
import { audio } from '@kit.AudioKit';
import { getFlashMode, getFocusMode } from './service/utils';
import AVPlayerService from './service/AVPlayerService';


const TAG: string = 'RTNCameraKitView';
let timerId: number | null;


@Component
export struct RTNCameraView {
  public static readonly NAME = RNC.RTNCameraView.NAME
  public ctx!: RNComponentContext
  public tag: number = 0
  private appContext: common.Context | undefined = getContext(this);
  private windowClass: window.Window | undefined = undefined;
  private eventEmitter: RNC.RTNCameraView.EventEmitter | undefined = undefined
  private cleanUpCallbacks: (() => void)[] = []
  private audioManager = audio.getAudioManager();
  private audioVolumeManager = this.audioManager.getVolumeManager();
  private prevProps: CameraProps | undefined = undefined;
  //
  @State private descriptorWrapper: RNC.RTNCameraView.DescriptorWrapper = {} as RNC.RTNCameraView.DescriptorWrapper
  @State cameraDeviceIndex: number = 0; // 后置相机
  @State surfaceId: string = '';
  @State onShow: boolean = false;
  @StorageLink('defaultAspectRatio') @Watch('setDisplay') defaultAspectRatio: number
    = Constants.MIN_ASPECT_RATIO;
  @State flashMode: camera.FlashMode = camera.FlashMode.FLASH_MODE_CLOSE; // 关闭对焦
  @State focusPointBol: boolean = false; // 是否对焦标志
  @State focusPointVal: Array<number> = [0, 0]; // 曝光区域手指点击坐标
  @State scaleValue: number = 1 //变焦初始值
  @State pinchValue: number = 1;
  //
  @State screenWidth: number = 0 // 屏幕宽带
  @State screenHeight: number = 0 //屏幕高度
  @State displayHeight: number = 0 // 显示高度，单位vp
  @State displayWidth: number = 0 // 显示宽度，单位vp
  @State cameraHeight: number = 640 // 设置预览流高度，默认单位：vp
  @State cameraWidth: number = 360 // 设置预览流宽度，默认单位：vp
  @State cameraOffsetX: number = 0 // 设置预览流x轴方向偏移量，默认单位：vp
  @State cameraOffsetY: number = 0 // 设置预览流y轴方向偏移量，默认单位：vp
  @State scanResult: Array<scanBarcode.ScanResult> | undefined = undefined;
  @State isScan: boolean | undefined = undefined; //是否扫码
  @State isScanned: boolean = false;
  @State tipShow: boolean = false;
  @State isInitSuccess: boolean = false;
  @State currentProps: CameraProps = {};
  @State allPermissionStatus: AllPermissionStatus = {
    cameraStatus: CAMERA_STATUS.PENDING_AUTHORIZATION,
    recordAudioPermissionStatus: RecordAudioPermissionStatusEnum.PENDING_AUTHORIZATION
  }
  mXComponentController: XComponentController = new XComponentController();
  atManager = abilityAccessCtrl.createAtManager();
  private scanOptions: scanBarcode.ScanOptions = {
    // 扫码类型，可选参数
    scanTypes: [scanCore.ScanType.ALL],
    // 是否开启多码识别，可选参数
    enableMultiMode: true,
    // 是否开启相册扫码，可选参数
    enableAlbum: true,
  }

  aboutToAppear() {
    this.eventEmitter = new RNC.RTNCameraView.EventEmitter(this.ctx.rnInstance, this.tag)
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<RNC.RTNCameraView.DescriptorWrapper>(this.tag)!)
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (_descriptor, newDescriptorWrapper) => {
        this.onDescriptorWrapperChange(newDescriptorWrapper! as RNC.RTNCameraView.DescriptorWrapper)
      }
    ))
    const descriptorBase = this.descriptorWrapper['descriptor'];
    const props = descriptorBase.rawProps;
    this.getLastWindow();
    this.subscribeToLifecycleEvents();
    this.registerCommandCallback();
    this.requestPermissionsFn(props)
    this.setDisplay();
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cb => cb());
    this.handleRelease();
  }

  private onDescriptorWrapperChange(descriptorWrapper: RNC.RTNCameraView.DescriptorWrapper) {
    this.descriptorWrapper = descriptorWrapper;
    const props = this.descriptorWrapper.props as CameraProps
    this.currentProps = props;
    this.updateProps(props)
    this.prevProps = props;
  }

  setDisplay() {
    const props = this.descriptorWrapper.props;
    const width = this.descriptorWrapper.width;
    const height = this.descriptorWrapper.height;
    let displayClass = display.getDefaultDisplaySync(); //获取屏幕信息
    this.screenWidth = px2vp(displayClass.width);
    this.screenHeight = px2vp(displayClass.height)
    this.displayHeight = height || this.screenHeight; // 屏幕宽度
    this.displayWidth = width || this.screenWidth; // 屏幕高度
    this.cameraHeight = this.displayHeight;
    this.cameraWidth = this.displayWidth;
  }

  /*
* 获取权限
* */
  private async requestPermissionsFn(props: RNC.RTNCameraView.RawProps) {
    const status = await CameraManager.requestDeviceCameraAuthorization();
    if (status) {
      this.onShow = true;
      this.allPermissionStatus.cameraStatus = CAMERA_STATUS.READY;
    } else {
      this.allPermissionStatus.cameraStatus = CAMERA_STATUS.NOT_AUTHORIZED;
    }
    if (props.captureAudio) {
      const status = await CameraManager.requestMicrophoneAccess();
      if (status) {
        this.allPermissionStatus.recordAudioPermissionStatus = RecordAudioPermissionStatusEnum.AUTHORIZED;
      } else {
        this.allPermissionStatus.recordAudioPermissionStatus = RecordAudioPermissionStatusEnum.NOT_AUTHORIZED;
      }
    }
    this.onStatusChange(this.allPermissionStatus)
  }

  onCameraReady() {
    if (this.ctx) {
      this.ctx.rnInstance.emitDeviceEvent('onCameraReady', {});
    }
  }

  onStatusChange(status: AllPermissionStatus) {
    if (this.ctx) {
      this.ctx.rnInstance.emitDeviceEvent('onStatusChange', status);
    }
  }

  getLastWindow() {
    window.getLastWindow(this.appContext).then((lastWindow) => {
      this.windowClass = lastWindow;
    })
  }

  /**
   * 订阅生命周期监听事件
   */
  subscribeToLifecycleEvents() {
    this.ctx.rnInstance.subscribeToLifecycleEvents("FOREGROUND", () => {
      const props = this.descriptorWrapper['descriptor'].rawProps as CameraProps;
      CameraService.initCamera({
        surfaceId: this.surfaceId,
        cameraDeviceIndex: this.cameraDeviceIndex,
        cameraProps: this.currentProps,
        initSuccessCallBack: () => {
          this.isInitSuccess = true;
          this.initProps(this.currentProps)
          this.onCameraReady()
        }
      }
      );

    })
    this.ctx.rnInstance.subscribeToLifecycleEvents("BACKGROUND", async () => {
      this.handleRelease();
    })
  }

  /*
   *订阅事件回调
   * */
  registerCommandCallback() {
    if (this.ctx) {
      this.ctx.componentCommandReceiver.registerCommandCallback(
        this.tag,
        (command: string, args: (string | number | boolean | object)[]) => {
          Logger.info(TAG, `registerCommandCallback: option,  ${JSON.stringify(args)}`)
          Logger.info(TAG, `registerCommandCallback: command,  ${JSON.stringify(command)}`)
          if (command === Constants.TACK_PHOTO) {
            let options = args[0] as TakePictureOptions
            this.takePhoto(options)
          }
          if (command === 'getSupportedRatiosAsync') {
            CameraService.getSupportedRatiosAsync()
          }

          if (command === Constants.REQUEST_DEVICE_CAMERA_AUTHOR) {

          }
          if (command === Constants.CHECK_DEVICE_CAMERA_AUTHOR) {
          }
        });
    }
  }

  async takePhoto(options: TakePictureOptions) {
    const result = await CameraService.takePictureAsync(options);
    if (this.currentProps.playSoundOnCapture) {
      AVPlayerService.avPlayerFdSrc();
    }
    this.ctx.rnInstance.emitDeviceEvent('takePictureAsync', result);
  }

  /*
   *
   * */
  handleRelease() {
    CameraService.releaseCamera();
    ScanService.scanRelease();
    this.isScanned = false;
    this.tipShow = false;
    this.isInitSuccess = false;
  }

  async initSession(): Promise<void> {
    this.isInitSuccess = false;
    this.surfaceId = this.mXComponentController.getXComponentSurfaceId();
    const isCamera = true;
    if (isCamera) {
      // 拍照服务
      CameraService.setCtx(this.ctx);
      await CameraService.initCamera({
        surfaceId: this.surfaceId,
        cameraDeviceIndex: this.cameraDeviceIndex,
        cameraProps: this.currentProps,
        initSuccessCallBack: () => {
          this.isInitSuccess = true;
          this.initProps(this.currentProps)
          this.onCameraReady()
        }
      }
      );
    }
  }

  initProps(props: CameraProps): void {
    Logger.info(TAG, `CameraProps:${JSON.stringify(props)}`)
    const type = props.type ?? 'back'
    const exposure = props.exposure;
    const autoFocusPointOfInterest = props.autoFocusPointOfInterest
    const torchMode = props.torchMode
    const zoom = props.zoom
    const flashMode = getFlashMode(props.flashMode)
    const focusMode = getFocusMode(props.autoFocus);
    CameraService.setProps(props)

    if (!isEmptyValue(type)) {
      CameraService.setCameraType(type);
    }
    if (!isEmptyValue(exposure)) {
      CameraService.setExposure(exposure);
    }
    if (!isEmptyValue(focusMode)) {
      CameraService.setFocusModeFn(focusMode)
    }
    if (!isEmptyValue(autoFocusPointOfInterest)) {
      CameraService.setFocusPoint(autoFocusPointOfInterest)
    }
    if (!isEmptyValue(flashMode)) {
      CameraService.setFlashModeFn(flashMode)
    }
    if (!isEmptyValue(torchMode)) {
      CameraService.setTorchFn(torchMode)
    }
    if (!isEmptyValue(zoom)) {
      CameraService.setZoomRatioFn(zoom)
    }
  }

  updateProps(props: CameraProps) {
    Logger.info(TAG, `CameraProps:${JSON.stringify(props)}`)
    const type = props.type ?? 'back'
    const exposure = props.exposure;
    const autoFocusPointOfInterest = props.autoFocusPointOfInterest
    const torchMode = props.torchMode
    const zoom = props.zoom
    const flashMode = getFlashMode(props.flashMode)
    const focusMode = getFocusMode(props.autoFocus);
    CameraService.setProps(props)

    if (!isEmptyValue(type)) {
      CameraService.setCameraType(type);
    }
    if (!isEmptyValue(exposure)) {
      CameraService.setExposure(exposure);
    }
    if (!isEmptyValue(focusMode)) {
      CameraService.setFocusModeFn(focusMode)
    }
    if (!isEmptyValue(autoFocusPointOfInterest)) {
      CameraService.setFocusPoint(autoFocusPointOfInterest)
    }
    if (!isEmptyValue(flashMode)) {
      CameraService.setFlashModeFn(flashMode)
    }
    if (!isEmptyValue(torchMode)) {
      CameraService.setTorchFn(torchMode)
    }
    if (!isEmptyValue(zoom)) {
      CameraService.setZoomRatioFn(zoom)
    }
  }

  scaleValueChange(): void {
    let zoom = CameraService.getZoomRatioFn();
    this.pinchValue = this.scaleValue * zoom;
    let zoomValue = Number(this.pinchValue.toFixed((2)));
    CameraService.setZoomRatioFn(zoomValue)
  }

  onError(message: string) {
    Logger.error(TAG, message);
    this.ctx.rnInstance.emitDeviceEvent('onMountError', { message: message });
  }

  @Builder
  FocusBuilder() {
    //对焦框
    FocusComponent({
      focusPointBol: $focusPointBol,
      focusPointVal: $focusPointVal,
      focusColor: Color.White,
    })
    // 曝光对焦手指点击区域
    FocusAreaComponent({
      focusPointBol: $focusPointBol,
      focusPointVal: $focusPointVal,
      xComponentWidth: this.cameraWidth,
      xComponentHeight: this.cameraHeight,
      focusFrameDisplayDuration: 2000,
      isScan: this.isScan,
      cameraOffsetX: this.cameraOffsetX,
      cameraOffsetY: this.cameraOffsetY
    })
  }

  @Builder
  CameraView() {
    XComponent({
      id: 'componentId',
      type: 'surface',
      controller: this.mXComponentController
    })
      .onLoad(async () => {
        await this.initSession();
      })
      .backgroundColor(Color.Black)
      .height(this.cameraHeight)
      .width(this.cameraWidth)
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Stack() {
        this.CameraView();
        this.FocusBuilder();
      }
      .height('100%')
      .width('100%')
      .backgroundColor(Color.Black)
      .gesture(
        PinchGesture({ fingers: 2 })
          .onActionStart((event: GestureEvent) => {
          })
          .onActionUpdate((event: GestureEvent) => {
            if (event) {
              this.scaleValue = event.scale;
            }
          })
          .onActionEnd(() => {
            if (this.currentProps.useNativeZoom) {
              this.scaleValueChange()
            }
          })
      )
    }
  }
}