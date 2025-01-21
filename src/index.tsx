import RNCamera, { type Status as _CameraStatus, hasTorch } from './RTNCameraNativeComponent';
import FaceDetector from './FaceDetector';

export type CameraStatus = _CameraStatus;
export { RNCamera, FaceDetector, hasTorch };



