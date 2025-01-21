// @flow
import { NativeModules } from 'react-native';

const faceDetectionDisabledMessage = "Face detection is disabled";
const FaceDetectorModule = NativeModules.RNFaceDetector || {
  stubbed: true,
  Mode: {},
  Landmarks: {},
  Classifications: {},
  detectFaces: () => new Promise((_, reject) => reject(faceDetectionDisabledMessage)),
};

type Point = { x: number, y: number };

export type FaceFeature = {
  bounds: {
    size: {
      width: number,
      height: number,
    },
    origin: Point,
  },
  smilingProbability?: number,
  leftEarPosition?: Point,
  rightEarPosition?: Point,
  leftEyePosition?: Point,
  leftEyeOpenProbability?: number,
  rightEyePosition?: Point,
  rightEyeOpenProbability?: number,
  leftCheekPosition?: Point,
  rightCheekPosition?: Point,
  leftMouthPosition?: Point,
  mouthPosition?: Point,
  rightMouthPosition?: Point,
  bottomMouthPosition?: Point,
  noseBasePosition?: Point,
  yawAngle?: number,
  rollAngle?: number,
};

type DetectionOptions = {
  mode?: keyof typeof FaceDetectorModule.Mode | undefined,
  detectLandmarks?: keyof typeof FaceDetectorModule.Landmarks | undefined,
  runClassifications?: keyof typeof FaceDetectorModule.Classifications | undefined,
};

export default class FaceDetector {
  static Constants = {
    Mode: FaceDetectorModule.Mode,
    Landmarks: FaceDetectorModule.Landmarks,
    Classifications: FaceDetectorModule.Classifications,
  };

  static detectFacesAsync(uri: string, options?: DetectionOptions): Promise<Array<FaceFeature>> {
    return FaceDetectorModule.detectFaces({...(options || {}), uri });
  }
}

export const Constants = FaceDetector.Constants;
