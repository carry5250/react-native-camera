import { FaceFeature } from './type'
export namespace FaceDetectorModuleSpec {
    export const NAME = 'FaceDetectorModule' as const
  
    export interface Spec {
      detectFaces(uri:string): Promise<FaceFeature[]>;
    }
}