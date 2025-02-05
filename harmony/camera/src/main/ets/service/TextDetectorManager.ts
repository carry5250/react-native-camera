import { image } from '@kit.ImageKit';
import { hilog } from '@kit.PerformanceAnalysisKit';
import { BusinessError } from '@kit.BasicServicesKit';
import { fileIo } from '@kit.CoreFileKit';
import { photoAccessHelper } from '@kit.MediaLibraryKit';
import { buffer } from '@kit.ArkTS';
import fs from '@ohos.file.fs';
import { textRecognition } from '@kit.CoreVisionKit';
export default class FaceDetectorManager {
  infoLog(info:string):void {
    hilog.info(0x0000,'FaceDetectorManager',info)
  }


  private openPhoto(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let photoPicker: photoAccessHelper.PhotoViewPicker = new photoAccessHelper.PhotoViewPicker();
      photoPicker.select({
        MIMEType: photoAccessHelper.PhotoViewMIMETypes.IMAGE_TYPE, maxSelectNumber: 1
      }).then(res => {
        resolve(res.photoUris[0])
      }).catch((err: BusinessError) => {
        hilog.error(0x0000, 'objectDetectSample', `Failed to get photo image uri. code：${err.code}，message：${err.message}`);
        reject('')
      })
    })
  }
  private async getFileBase64(uri: string) {
    let file = fs.openSync(uri, fs.OpenMode.READ_ONLY);
    let arrayBuffer = new ArrayBuffer(100 * 1024 * 1024);
    let readLen = fs.readSync(file.fd, arrayBuffer);
    return buffer.from(arrayBuffer, 0, readLen).toString('base64');
  }
  async detectText(uri:string): Promise<string> {
    let testUri = await this.openPhoto()
    if (testUri === undefined) {
      hilog.error(0x0000, 'objectDetectSample', "Failed to defined uri.");
      return Promise.reject('none img')
    }
    let imageSource: image.ImageSource | undefined = undefined;
    let fileSource = await fileIo.open(testUri, fileIo.OpenMode.READ_ONLY);
    imageSource = image.createImageSource(fileSource.fd);
    let img = await imageSource.createPixelMap();
    let imgInfo = await img.getImageInfo()
    this.infoLog(JSON.stringify(imgInfo))

    // let base64 = await this.getFileBase64(testUri)
    let visionInfo: textRecognition.VisionInfo = {
      pixelMap: img,
    };
    let textConfiguration: textRecognition.TextRecognitionConfiguration = {
      isDirectionDetectionSupported: true
    };
    let recognitionString: string = '';
    let TextRecognitionResult =  await textRecognition.recognizeText(visionInfo, textConfiguration)
    if (TextRecognitionResult.value === '') {
      recognitionString = ''
    } else {
      recognitionString = TextRecognitionResult.value;
    }
    this.infoLog(JSON.stringify(TextRecognitionResult))
    return Promise.resolve(JSON.stringify(TextRecognitionResult))
  }

}