import { registerWebModule, NativeModule } from 'expo';

// HealthBridge web'de yok; çağıranlar zaten Platform kontrolü yapıyor.
class HealthBridgeModule extends NativeModule<{}> {}

export default registerWebModule(HealthBridgeModule, 'HealthBridgeModule');
