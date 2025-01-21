#pragma once

#include "RNOH/generated/BaseRtnCameraPackage.h"

namespace rnoh {

class RTNCameraPackage : public BaseRtnCameraPackage {
    using Super = BaseRtnCameraPackage;

public:
    RTNCameraPackage(Package::Context ctx) : Super(ctx) {}
};
} // namespace rnoh