#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(TelephonyModule, NSObject)

RCT_EXTERN_METHOD(getNetworkQoSDetails:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

@end
