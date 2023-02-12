import { Platform } from 'react-native'

export const adaptiveScale = (size: number, factor: number = 0) =>
  factor ? Math.round(size + size * (factor / 8)) : size

export const isLargeDevice = (Platform.OS === 'ios' && Platform.isPad) || Platform.OS === 'macos'
