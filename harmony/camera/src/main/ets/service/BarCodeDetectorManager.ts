import { image } from '@kit.ImageKit';
import { detectBarcode, scanBarcode, scanCore } from '@kit.ScanKit';
import { BarCodeReadEvent,BarCodeType } from '../types'
import Logger from '../utils/Logger'
import { BusinessError } from '@kit.BasicServicesKit';
import json from '@ohos.util.json';

const TAG: string = 'BarCodeDetectorManager';
export default class BarCodeDetectorManager {

  static async decodeImageBuffer(buffer: ArrayBuffer, size:image.Size):Promise<BarCodeReadEvent> {
    try {
      let byteImg: detectBarcode.ByteImage = {
        byteBuffer: buffer,
        width: size.width,
        height: size.height,
        format: detectBarcode.ImageFormat.NV21
      }

      let options: scanBarcode.ScanOptions = {
        scanTypes: [scanCore.ScanType.ALL],
        enableMultiMode: false,
        enableAlbum: false
      }
      let result:detectBarcode.DetectResult = await detectBarcode.decodeImage(byteImg, options)
      let event = this.convertDetectResultToBarCodeReadEvent(result)
      if (event.length > 0) {
        return Promise.resolve(event[0])
      }else {
        return Promise.resolve(undefined)
      }

    } catch (error) {
      Logger.error(TAG,`decode error:${JSON.stringify(error)}`)
      return Promise.reject(error)
    }

  }
  static convertDetectResultToBarCodeReadEvent(
    detectResult: detectBarcode.DetectResult
  ): BarCodeReadEvent[] {
    return detectResult.scanResults.map((scanResult) => {
      const type = this.convertScanTypeToBarCodeType(scanResult.scanType);
      const bounds = this.convertScanCodeRectToBounds(scanResult.scanCodeRect);
      return {
        data: scanResult.originalValue,
        rawData: scanResult.originalValue, // Assuming rawData is the same as originalValue
        type: type,
        bounds: bounds,
        image: '', // Assuming no image data is available in DetectResult
      };
    });
  }

  static convertScanTypeToBarCodeType(scanType: scanCore.ScanType): keyof BarCodeType {
    switch (scanType) {
      case scanCore.ScanType.AZTEC_CODE:
        return 'aztec';
      case scanCore.ScanType.CODE128_CODE:
        return 'code128';
      case scanCore.ScanType.CODE39_CODE:
        return 'code39';
      case scanCore.ScanType.CODE93_CODE:
        return 'code93';
      case scanCore.ScanType.EAN13_CODE:
        return 'ean13';
      case scanCore.ScanType.EAN8_CODE:
        return 'ean8';
      case scanCore.ScanType.PDF417_CODE:
        return 'pdf417';
      case scanCore.ScanType.QR_CODE:
        return 'qr';
      case scanCore.ScanType.UPC_E_CODE:
        return 'upc_e';
      case scanCore.ScanType.ITF14_CODE:
        return 'itf14';
      case scanCore.ScanType.DATAMATRIX_CODE:
        return 'datamatrix';
      default:
        throw new Error(`Unsupported scan type: ${scanType}`);
    }
  }

  static convertScanCodeRectToBounds(
    scanCodeRect?: scanBarcode.ScanCodeRect
  ): { width: number; height: number; origin: Array<{x:string,y:string}> } {
    if (!scanCodeRect) {
      return {
        width: 0,
        height: 0,
        origin: [{ x: '0', y: '0' }],
      };
    }

    const width = scanCodeRect.right - scanCodeRect.left;
    const height = scanCodeRect.bottom - scanCodeRect.top;

    return {
      width: width,
      height: height,
      origin: [
        { x: scanCodeRect.left.toString(), y: scanCodeRect.top.toString() },
      ],
    };
  }
}