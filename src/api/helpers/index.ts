import Constants from "expo-constants"
import { Platform } from "react-native"

const userAgent = { 'User-Agent': `tooot/${Constants.expoConfig?.version} ${Platform.OS}/${Platform.Version}` }

export { userAgent }