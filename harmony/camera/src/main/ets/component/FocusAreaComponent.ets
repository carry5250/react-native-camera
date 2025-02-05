/*
 * Copyright (c) 2024 Huawei Device Co., Ltd. All rights reserved
 * Use of this source code is governed by a MIT license that can be
 * found in the LICENSE file.
 */

import CameraService from '../service/CameraService';
import ScanService from '../service/ScanService';
import { scanBarcode } from '@kit.ScanKit';
import { camera } from '@kit.CameraKit';
import Logger from '../utils/Logger';

const TAG: string = 'FocusAreaComponent';

// 对焦区域组件
@Component
export struct FocusAreaComponent {
  @Link focusPointBol: boolean;
  @Link focusPointVal: Array<number>;
  @Prop xComponentWidth: number;
  @Prop xComponentHeight: number;
  @Prop isScan: boolean | undefined;
  // 对焦区域显示框定时器
  private areaTimer: number = -1;
  @Prop focusFrameDisplayDuration: number = 2000;
  @Prop cameraOffsetX: number;
  @Prop cameraOffsetY: number;

  build() {
    Row() {
    }
    .width(this.xComponentWidth)
    .height(this.xComponentHeight)
    .opacity(1)
    .onTouch((e: TouchEvent) => {
      if (e.type === TouchType.Down) {
        this.focusPointBol = true;
        this.focusPointVal[0] = e.touches[0].x + this.cameraOffsetX;
        this.focusPointVal[1] = e.touches[0].y + this.cameraOffsetY;
        CameraService.onTap({ x: e.touches[0].x, y: e.touches[0].y })
        // 归一化焦点。 设置的焦点与相机sensor角度和窗口方向有关（相机sensor角度可通过CameraDevice的cameraOrientation属性获取），下面焦点是以竖屏窗口，相机sensor角度为90度场景下的焦点设置
        const point: scanBarcode.Point | camera.Point =
          { x: e.touches[0].y / this.xComponentHeight, y: 1 - (e.touches[0].x / this.xComponentWidth) };
        if (this.isScan) {
          ScanService.setFocusPointFn(point)
        } else {
          CameraService.setFocusPoint(point);
        }
      }
      if (e.type === TouchType.Up) {
        if (this.areaTimer) {
          clearTimeout(this.areaTimer);
        }
        this.areaTimer = setTimeout(() => {
          this.focusPointBol = false;
        }, this.focusFrameDisplayDuration);
      }
    })
    .gesture(
      TapGesture({ count: 2 })
        .onAction((event: GestureEvent) => {
          if (event) {
            Logger.info(TAG, `'onAction'${JSON.stringify(event)}`);
            const fingerList = event.fingerList[0]
            CameraService.onDoubleTap({ x: fingerList.localX, y: fingerList.localY })
          }
        })
    )
    .zIndex(5)
  }
}
