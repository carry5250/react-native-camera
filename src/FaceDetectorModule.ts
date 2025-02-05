import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

type Point = { x: number, y: number };

type FaceFeature = {
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

export interface Spec extends TurboModule {
    detectFaces: (uri:string) => Promise<FaceFeature[]>;
}

export default TurboModuleRegistry.get<Spec>('FaceDetectorModule') as Spec | null;