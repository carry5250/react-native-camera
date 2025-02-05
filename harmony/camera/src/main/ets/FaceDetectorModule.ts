import { TurboModule } from '@rnoh/react-native-openharmony/ts';
import { FaceFeature } from './types';
import { FaceDetectorModuleSpec } from './types/FaceDetectorModuleSpec';
import FaceDetectorManager from './service/FaceDetectorManager'
export class FaceDetectorModule extends TurboModule implements FaceDetectorModuleSpec.Spec {
    private manager:FaceDetectorManager = new FaceDetectorManager()

    detectFaces(uri:string): Promise<FaceFeature[]> {
      return this.manager.detectFaces(uri)
    }
}