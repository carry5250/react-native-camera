import { image } from '@kit.ImageKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { fileIo } from '@kit.CoreFileKit';
import { faceDetector } from '@kit.CoreVisionKit';
import { FaceFeature } from '../types'
import Logger from '../utils/Logger'

const TAG: string = 'FaceDetectorManager';

export default class FaceDetectorManager {

   async detectFaces(uri:string): Promise<Array<FaceFeature>> {

    let imageSource: image.ImageSource | undefined = undefined;
    let fileSource:fileIo.File | undefined = undefined
    try {
      fileSource = await fileIo.open(uri, fileIo.OpenMode.READ_ONLY);
    } catch (error) {
      Logger.error(TAG, `open file faild:${JSON.stringify(error)}`);
      return Promise.reject(error)
    }
    if (!canIUse("SystemCapability.AI.Face.Detector")) {
      return Promise.reject('device not support FaceDetector')
    }
    try {
      faceDetector.init();
      imageSource = image.createImageSource(fileSource.fd);
      let img = await imageSource.createPixelMap();

      let visionInfo: faceDetector.VisionInfo = {
        pixelMap: img,
      };
      let data = await faceDetector.detect(visionInfo)
      let results:Array<FaceFeature> = data.map((face)=>{
        let faceFeature:FaceFeature = {
          bounds: {
            origin:{x:face.rect.left,y:face.rect.top},
            size: {width:face.rect.width,height:face.rect.height}
          },
          yawAngle: face.pose.yaw,
          rollAngle: face.pose.roll
        }
        return faceFeature
      })
      imageSource.release();
      img.release();
      faceDetector.release()
      return Promise.resolve(results)
    } catch (e) {
      Logger.error(TAG,`detect faild：${JSON.stringify(e)}`)
      return Promise.reject(JSON.stringify(e))
    }

  }

}