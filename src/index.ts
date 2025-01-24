import { type Status as _CameraStatus, hasTorch } from './RTNCameraNativeComponent';
import FaceDetector from './FaceDetector';
import RNCamera, { CameraRefType } from './Camera'


export type CameraStatus = _CameraStatus;
export { RNCamera, FaceDetector, hasTorch, CameraRefType };



