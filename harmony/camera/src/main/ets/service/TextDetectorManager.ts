import { image } from '@kit.ImageKit';
import { textRecognition } from '@kit.CoreVisionKit';
import { TrackedTextFeature, TrackedTextFeatureRecursive } from '../types'
import Logger from '../utils/Logger'
import { BusinessError } from '@kit.BasicServicesKit';
const TAG: string = 'TextDetectorManager';
export default class TextDetectorManager {

  static async detectText(buffer:ArrayBuffer,size:image.Size): Promise<TrackedTextFeature[]> {
    let pixelMapInstance:image.PixelMap| undefined = undefined
    try {
      pixelMapInstance = await image.createPixelMap(buffer, {
        size: {
          height: size.height,
          width: size.width
        },
        srcPixelFormat: image.PixelMapFormat.NV21
      })
    } catch (error) {
      Logger.error(TAG, `create image faild:${JSON.stringify(error)}`);
      return Promise.reject(error)
    }
    if (!canIUse("SystemCapability.AI.OCR.TextRecognition")) {
      return Promise.reject('device not support FaceDetector')
    }

    let visionInfo: textRecognition.VisionInfo = {
      pixelMap: pixelMapInstance,
    };
    let textConfiguration: textRecognition.TextRecognitionConfiguration = {
      isDirectionDetectionSupported: true
    };
    try {
      let TextRecognitionResult = await textRecognition.recognizeText(visionInfo,textConfiguration)
      let textFeatures = this.convertTextRecognitionResultToTrackedTextFeatures(TextRecognitionResult)
      pixelMapInstance.release();
      return Promise.resolve(textFeatures)
    } catch (e) {
      Logger.error(TAG,`detect faild：${JSON.stringify(e)}`)
      pixelMapInstance.release();
      return Promise.reject(JSON.stringify(e))
    }

  }
  static  convertTextRecognitionResultToTrackedTextFeatures(
    result: textRecognition.TextRecognitionResult
  ): TrackedTextFeature[] {
    const features: TrackedTextFeature[] = [];

    result.blocks.forEach(block => {
      const blockFeature: TrackedTextFeature = {
        type: 'block',
        bounds: {
          // 注意：这里我们没有 Size 和 Point 的泛型类型，所以默认使用 number 类型
          size: { width: 0, height: 0 },
          origin: { x: 0, y: 0 }
        },
        value: block.value,
        components: [],
      };

      block.lines.forEach(line => {
        const lineFeature: TrackedTextFeatureRecursive = {
          type: 'line',
          bounds: {
            size: { width: 0, height: 0 },
            origin: { x: 0, y: 0 }
          },
          value: line.value,
          components: [],
        };

        // 设置 lineFeature 的 cornerPoints（如果需要的话，这里简化为不设置）
        // lineFeature.bounds.origin 和 lineFeature.bounds.size 应该根据 line.cornerPoints 来计算

        line.words.forEach(word => {
          const wordFeature: TrackedTextFeatureRecursive = {
            type: 'element', // 或者根据需求使用其他类型
            bounds: {
              size: { width: 0, height: 0 },
              origin: {
                x: word.cornerPoints[0].x,
                y: word.cornerPoints[0].y,
              }
            },
            value: word.value,
            components: [], // 如果没有子组件，则保持为空
          };

          // 可以根据 word.cornerPoints 进一步细化 wordFeature 的 bounds

          lineFeature.components!.push(wordFeature);
        });

        blockFeature.components!.push(lineFeature);
      });

      features.push(blockFeature);
    });
    if (result.value !== '') {
      Logger.info(TAG,`TextRecognitionResult:${JSON.stringify(result)}`)
      Logger.info(TAG,`features:${JSON.stringify(features)}`)
    }

    return features;
  }

}