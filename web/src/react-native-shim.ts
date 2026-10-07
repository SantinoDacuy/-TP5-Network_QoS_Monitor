export const Platform = {
  OS: 'web',
  select: (obj: any) => obj.web || obj.default
};

export const NativeModules = {
  TelephonyModule: null
};

export default {
  Platform,
  NativeModules
};
