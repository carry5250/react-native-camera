import React from "react";
import { HostComponent, View, StyleSheet, DeviceEventEmitter } from "react-native";
import { NativeProps } from "./RTNCameraNativeComponent";
import { HardwareCamera, Orientation, OrientationNumber, RecordResponse, TakePictureOptions, VideoCodec, VideoQuality } from "../types";
import { forwardRef, useImperativeHandle, useRef } from "react";
import NativeVisionCameraView from './RTNCameraNativeComponent'
import codegenNativeCommands from "react-native/Libraries/Utilities/codegenNativeCommands";




type CameraCommands =

    | 'takePictureAsync'
    | 'recordAsync'
    | 'refreshAuthorizationStatus'
    | 'stopRecording'
    | 'pausePreview'
    | 'resumePreview'
    | 'getSupportedRatiosAsync'
    | 'checkIfVideoIsValid'
    | 'getCameraIdsAsync'
    | 'isRecording'

type CameraComponentType = HostComponent<NativeProps>

interface TakePictureResponse {
    width: number;
    height: number;
    uri: string;
    base64?: string;
    exif?: { [name: string]: any };
    pictureOrientation: number;
    deviceOrientation: number;
}

interface RecordOptions {
    quality?: keyof VideoQuality;
    orientation?: keyof Orientation | OrientationNumber;
    maxDuration?: number;
    maxFileSize?: number;
    mute?: boolean;
    mirrorVideo?: boolean;
    path?: string;
    videoBitrate?: number;
    fps?: number;
    /** iOS only */
    codec?: keyof VideoCodec | VideoCodec[keyof VideoCodec];
}


export const CameraCommands = codegenNativeCommands<CameraCommandsType>({
    supportedCommands: [
        'takePictureAsync',
        'recordAsync',
        'refreshAuthorizationStatus',
        'stopRecording',
        'pausePreview',
        'resumePreview',
        'getSupportedRatiosAsync',
        'checkIfVideoIsValid',
        'getCameraIdsAsync',
        'isRecording',
    ],
});

export interface CameraCommandsType {
    takePictureAsync(viewRef: React.ElementRef<CameraComponentType>, options?: TakePictureOptions): Promise<TakePictureResponse>;
    recordAsync(viewRef: React.ElementRef<CameraComponentType>, options?: RecordOptions): Promise<RecordResponse>;
    refreshAuthorizationStatus(viewRef: React.ElementRef<CameraComponentType>): Promise<void>;
    stopRecording(viewRef: React.ElementRef<CameraComponentType>): void;
    pausePreview(viewRef: React.ElementRef<CameraComponentType>): void;
    resumePreview(viewRef: React.ElementRef<CameraComponentType>): void;
    getSupportedRatiosAsync(viewRef: React.ElementRef<CameraComponentType>): Promise<string[]>;
    checkIfVideoIsValid(viewRef: React.ElementRef<CameraComponentType>): Promise<boolean>;
    getCameraIdsAsync: (viewRef: React.ElementRef<CameraComponentType>) => Promise<HardwareCamera[]>;
    isRecording: (viewRef: React.ElementRef<CameraComponentType>) => Promise<boolean>;
}


export interface CameraRef extends Omit<CameraCommandsType, CameraCommands> {
    takePictureAsync(options?: TakePictureOptions): Promise<TakePictureResponse>;
    recordAsync(options?: RecordOptions): Promise<RecordResponse>;
    refreshAuthorizationStatus(): Promise<void>;
    stopRecording(): void;
    pausePreview(): void;
    resumePreview(): void;
    getSupportedRatiosAsync(): Promise<string[]>;
    checkIfVideoIsValid(): Promise<boolean>;
    getCameraIdsAsync: () => Promise<HardwareCamera[]>;
    isRecording: () => Promise<boolean>;
}

export const Camera = forwardRef<CameraRef, NativeProps>(
    (
        {
            style,
            onTouchEnd,
            ...rest
        },
        ref
    ) => {
        const VisionCameraRef = useRef<React.ElementRef<CameraComponentType>>(null);

        const takePictureAsync = (options?: TakePictureOptions): Promise<TakePictureResponse> => {
            return new Promise((resolve) => {
                const onCodeScannedListener = DeviceEventEmitter.addListener('takePictureAsync', (data: TakePictureResponse) => {
                    resolve(data);
                    onCodeScannedListener.remove();
                });
                if (!VisionCameraRef.current) throw new Error("VisionCameraRef.current is NaN");
                CameraCommands.takePictureAsync(VisionCameraRef.current);
            })
        };

        const recordAsync = () => { }

        // React.useImperativeHandle(ref, () => ({
        //     takePictureAsync,
        //     recordAsync,
        //     refreshAuthorizationStatus,
        //   }));


        return (
            <View style={style} >
                <NativeVisionCameraView
                    ref={VisionCameraRef}
                    style={StyleSheet.absoluteFill}
                    {...rest}
                />
            </View>
        );
    }
);
