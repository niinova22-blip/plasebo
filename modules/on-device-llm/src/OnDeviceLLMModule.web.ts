import { registerWebModule, NativeModule } from 'expo';

// Cihaz üstü model web'de yok; çağıranlar zaten yedek metne düşüyor.
class OnDeviceLLMModule extends NativeModule<{}> {}

export default registerWebModule(OnDeviceLLMModule, 'OnDeviceLLMModule');
