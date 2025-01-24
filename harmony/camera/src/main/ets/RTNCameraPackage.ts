import { RNPackage, TurboModulesFactory } from "@rnoh/react-native-openharmony/ts";
import type {
  TurboModule,
  TurboModuleContext,
  DescriptorWrapperFactoryByDescriptorTypeCtx,
  DescriptorWrapperFactoryByDescriptorType,
} from "@rnoh/react-native-openharmony/ts";
import { TM } from "@rnoh/react-native-openharmony/generated/ts";
import { RNC } from "./generated/ts";
import { RTNCameraModule } from './RTNCameraModule'

class RTNCameraModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === TM.RTNCamera.NAME) {
      return new RTNCameraModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === TM.RTNCamera.NAME;
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