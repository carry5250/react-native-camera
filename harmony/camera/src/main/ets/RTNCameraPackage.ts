import { RNPackage, TurboModulesFactory } from "@rnoh/react-native-openharmony/ts";
import type {
  TurboModule,
  TurboModuleContext,
  DescriptorWrapperFactoryByDescriptorTypeCtx,
  DescriptorWrapperFactoryByDescriptorType,
} from "@rnoh/react-native-openharmony/ts";
import {RTNCameraTurboModule} from './types/RTNCameraTurboModule'
import { RNC } from "./generated/ts";
import { RNCameraModule } from './RTNCameraModule'

class RTNCameraModulesFactory extends TurboModulesFactory {
  createTurboModule(name: string): TurboModule | null {
    if (name === RTNCameraTurboModule.NAME) {
      return new RNCameraModule(this.ctx);
    }
    return null;
  }

  hasTurboModule(name: string): boolean {
    return name === RTNCameraTurboModule.NAME;
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