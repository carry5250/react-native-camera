import { RNComponentContext, RNViewBase } from '@rnoh/react-native-openharmony';
import { RNC } from "./generated"

@Component
export struct RTNCameraView {
  public static readonly NAME = RNC.RTNCameraView.NAME
  public ctx!: RNComponentContext
  public tag: number = 0
  @State private descriptorWrapper: RNC.RTNCameraView.DescriptorWrapper = {} as RNC.RTNCameraView.DescriptorWrapper
  private eventEmitter: RNC.RTNCameraView.EventEmitter | undefined = undefined
  private cleanUpCallbacks: (() => void)[] = []

  aboutToAppear() {
    this.eventEmitter = new RNC.RTNCameraView.EventEmitter(this.ctx.rnInstance, this.tag)
    this.onDescriptorWrapperChange(this.ctx.descriptorRegistry.findDescriptorWrapperByTag<RNC.RTNCameraView.DescriptorWrapper>(this.tag)!)
    this.cleanUpCallbacks.push(this.ctx.descriptorRegistry.subscribeToDescriptorChanges(this.tag,
      (_descriptor, newDescriptorWrapper) => {
        this.onDescriptorWrapperChange(newDescriptorWrapper! as RNC.RTNCameraView.DescriptorWrapper)
      }
    ))
  }

  private onDescriptorWrapperChange(descriptorWrapper: RNC.RTNCameraView.DescriptorWrapper) {
    this.descriptorWrapper = descriptorWrapper
    console.log('descriptorWrapper',JSON.stringify(descriptorWrapper));
  }

  aboutToDisappear() {
    this.cleanUpCallbacks.forEach(cb => cb())
  }

  build() {
    RNViewBase({ ctx: this.ctx, tag: this.tag }) {
      Text(this.descriptorWrapper.props.text)
        .height("100%")
        .width("100%")
        .fontSize(30)
        .textAlign(TextAlign.Center)
        .fontColor(this.descriptorWrapper.props.color?.toRGBAString())
        .onTouch((e) => {
          this.eventEmitter?.emit("textTouch", { type: e.type })
        })
    }
  }
}