#pragma once

#include "RNOH/generated/BaseReactNativeCameraPackage.h"

namespace rnoh {

class RTNCameraPackage : public BaseReactNativeCameraPackage {
    using Super = BaseReactNativeCameraPackage;

public:
    RTNCameraPackage(Package::Context ctx) : Super(ctx) {}
};
} // namespace rnoh