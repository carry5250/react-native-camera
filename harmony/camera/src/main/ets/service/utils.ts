import { media } from "@kit.MediaKit";
import { camera } from "@kit.CameraKit";

const Resolution = {
  '2160p': { "width": 3840, "height": 2160 },
  '1080p': { "width": 1920, "height": 1080 },
  '720p': { "width": 1920, "height": 1080 },
  '480p': { "width": 640, "height": 480 },
  '4:3': { "width": 1920, "height": 1080 }
}

export function getResolutionSize(resolution: string): { width: number, height: number } {
  return Resolution[resolution];
}

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