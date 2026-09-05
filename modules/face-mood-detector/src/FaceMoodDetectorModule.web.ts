import { registerWebModule, NativeModule } from 'expo';

// FaceMoodDetectorModule is not available on the web platform.
class FaceMoodDetectorModule extends NativeModule<{}> {}

export default registerWebModule(FaceMoodDetectorModule, 'FaceMoodDetectorModule');
