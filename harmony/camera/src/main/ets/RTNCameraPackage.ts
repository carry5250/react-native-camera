import { RNPackage, TurboModulesFactory } from "@rnoh/react-native-openharmony/ts";
import type {
  TurboModule,
  TurboModuleContext,
  DescriptorWrapperFactoryByDescriptorTypeCtx,
  DescriptorWrapperFactoryByDescriptorType,
} from "@rnoh/react-native-openharmony/ts";
import { RNC } from "./generated/ts";
import { FaceDetectorModuleSpec } from './types/FaceDetectorModuleSpec'
import { FaceDetectorModule } from './FaceDetectorModule'

class RTNCameraModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === FaceDetectorModuleSpec.NAME) {
      return new FaceDetectorModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === FaceDetectorModuleSpec.NAME;
  }
}

export class RTNCameraPackage extends RNPackage {
  createTurboModulesFactory(ctx: TurboModuleContext): TurboModulesFactory {
    return new RTNCameraModulesFactory(ctx);
  }

  createDescriptorWrapperFactoryByDescriptorType(
    ctx: DescriptorWrapperFactoryByDescriptorTypeCtx
  ): DescriptorWrapperFactoryByDescriptorType {
    return {
      [RNC.RTNCameraView.NAME]: (ctx) =>
      new RNC.RTNCameraView.DescriptorWrapper(ctx.descriptor),
    };
  }
}