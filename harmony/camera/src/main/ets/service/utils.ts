import { media } from "@kit.MediaKit";
import { camera } from "@kit.CameraKit";


export function getResolutionSize(resolution: string): { width: number, height: number } {
  switch (resolution) {
    case '2160p':
      return { "width": 3840, "height": 2160 }
    case '1080p':
      return { "width": 1920, "height": 1080 }
    case '720p':
      return { "width": 1280, "height": 720 }
    case '480p':
      return { "width": 640, "height": 480 }
    case '4:3':
      return { "width": 1920, "height": 1080 }
    default:
      return { "width": 1920, "height": 1080 }
  }
}

/*
 * 获取角度
 * */
export function getOrientation(resolution: string | number): number {
  switch (resolution) {
    case 'portrait':
      return 0
    case 'auto':
      return 0
    case 'landscapeLeft':
      return 270
    case 'landscapeRight':
      return 90
    case 'portraitUpsideDown':
      return 180
    default:
      return 0
  }
}

export function getVideoCodec(code: any): media.CodecMimeType {
  switch (code) {
    case 'H264':
      return media.CodecMimeType.VIDEO_AVC
    case 'JPEG':
      return media.CodecMimeType.VIDEO_AVC
    case 'HVEC':
      return media.CodecMimeType.VIDEO_AVC
    case 'AppleProRes422':
      return media.CodecMimeType.VIDEO_AVC
    case 'AppleProRes4444':
      return media.CodecMimeType.VIDEO_HEVC
    default:
      return media.CodecMimeType.VIDEO_HEVC
  }
}

export const getFlashMode = (mode: string): camera.FlashMode => {
  switch (mode) {
    case 'auto':
      return camera.FlashMode.FLASH_MODE_AUTO
    case 'on':
      return camera.FlashMode.FLASH_MODE_OPEN
    case 'off':
      return camera.FlashMode.FLASH_MODE_CLOSE
    case 'torch':
      return camera.FlashMode.FLASH_MODE_ALWAYS_OPEN
  }

}

export const getFocusMode = (mode: string): camera.FocusMode => {
  if (mode === 'on') {
    return camera.FocusMode.FOCUS_MODE_AUTO
  } else if (mode === 'off') {
    return camera.FocusMode.FOCUS_MODE_LOCKED
  }
}


function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

export const getPhotoProfileList = (list: Array<any>): Array<{
  format?: number,
  ratio: string,
  size: { width: number, height: number },
  pictureSizes: string
}> => {
  return list.map(item => {
    const { width, height } = item.size;
    const divisor = gcd(width, height);
    const simplifiedWidth = width / divisor;
    const simplifiedHeight = height / divisor;
    const ratio = `${simplifiedWidth}:${simplifiedHeight}`;
    const pictureSizes = `${width}x${height}`;
    return { ...item, ratio, pictureSizes }
  })
}

export const getPhotoQuality = (quality: number): number => {
  if (quality <= 0) {
    return 0;
  } else if (quality > 0 && quality <= 1) {
    return 1
  } else {
    return 2
  }
}

export const getDeviceOrientation = (orientation: number) => {
  let deviceOrientation;
  if (orientation > 315 || orientation < 45) {
    deviceOrientation = 0;
  } else if (orientation > 45 && orientation < 135) {
    deviceOrientation = 90;
  } else if (orientation > 135 && orientation < 225) {
    deviceOrientation = 180;
  } else if (orientation > 225 && orientation < 315) {
    deviceOrientation = 270;
  } else {
    deviceOrientation = 0;
  }
  return deviceOrientation;
}

export const getVideoStabilizationMode = (mode: string) => {
  switch (mode) {
    case 'auto':
      return camera.VideoStabilizationMode.AUTO
    case 'cinematic':
      return camera.VideoStabilizationMode.HIGH
    case 'off':
      return camera.VideoStabilizationMode.OFF
    case 'standard':
      return camera.VideoStabilizationMode.MIDDLE
    default:
      return camera.VideoStabilizationMode.MIDDLE
  }
}