// @flow
import { NativeModules } from 'react-native';
import NativeFaceDetectorModule from './FaceDetectorModule'
const faceDetectionDisabledMessage = "Face detection is disabled";
const FaceDetectorModule = NativeFaceDetectorModule || {
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
  mode?: any,
  detectLandmarks?: any,
  runClassifications?: any,
};

export default class FaceDetector {
  static Constants = {
    Mode: {},
    Landmarks: {},
    Classifications: {},
  };

  static detectFacesAsync(uri: string, options?: DetectionOptions): Promise<Array<FaceFeature>> {
    return FaceDetectorModule.detectFaces(uri)
  }
}

export const Constants = FaceDetector.Constants;
