import { DarkTheme, DefaultTheme } from '@react-navigation/native'
import { Platform, PlatformColor } from 'react-native'

export type Theme = 'light' | 'dark_lighter' | 'dark_darker'

export type ColorDefinitions =
  | 'primaryDefault'
  | 'primaryOverlay'
  | 'secondary'
  | 'disabled'
  | 'blue'
  | 'red'
  | 'green'
  | 'yellow'
  | 'backgroundDefault'
  | 'backgroundDefaultTransparent'
  | 'backgroundOverlayDefault'
  | 'backgroundOverlayInvert'
  | 'border'
  | 'separator'
  | 'shimmerDefault'
  | 'shimmerHighlight'

const themeColors: {
  [key in ColorDefinitions]: {
    light: string
    dark_lighter: string
    dark_darker: string
  }
} = {
  primaryDefault: {
    light: 'rgb(18, 18, 18)',
    dark_lighter: 'rgb(250, 250, 250)',
    dark_darker: 'rgb(180, 180, 180)'
  },
  primaryOverlay: {
    light: 'rgb(250, 250, 250)',
    dark_lighter: 'rgb(200, 200, 200)',
    dark_darker: 'rgb(200, 200, 200)'
  },
  secondary: {
    light: 'rgb(135, 135, 135)',
    dark_lighter: 'rgb(160, 160, 160)',
    dark_darker: 'rgb(130, 130, 130)'
  },
  disabled: {
    light: 'rgb(220, 220, 220)',
    dark_lighter: 'rgb(70, 70, 70)',
    dark_darker: 'rgb(50, 50, 50)'
  },
  blue: {
    light: 'rgb(43, 144, 221)',
    dark_lighter: 'rgb(43, 144, 221)',
    dark_darker: 'rgb(43, 144, 221)'
  },
  red: {
    light: 'rgb(225, 45, 35)',
    dark_lighter: 'rgb(230, 60, 60)',
    dark_darker: 'rgb(225, 78, 79)'
  },
  green: {
    light: 'rgb(18, 158, 80)',
    dark_lighter: 'rgb(20, 185, 80)',
    dark_darker: 'rgb(18, 158, 80)'
  },
  yellow: {
    light: 'rgb(230, 166, 30)',
    dark_lighter: 'rgb(220, 160, 25)',
    dark_darker: 'rgb(200, 145, 25)'
  },

  backgroundDefault: {
    light: 'rgb(250, 250, 250)',
    dark_lighter: 'rgb(44, 44, 44)',
    dark_darker: 'rgb(0, 0, 0)'
  },
  backgroundDefaultTransparent: {
    light: 'rgba(250, 250, 250, 0)',
    dark_lighter: 'rgba(18, 18, 18, 0)',
    dark_darker: 'rgba(18, 18, 18, 0)'
  },
  backgroundOverlayDefault: {
    light: 'rgba(250, 250, 250, 0.5)',
    dark_lighter: 'rgba(44, 44, 44, 0.5)',
    dark_darker: 'rgba(18, 18, 18, 0.5)'
  },
  backgroundOverlayInvert: {
    light: 'rgba(25, 25, 25, 0.75)',
    dark_lighter: 'rgba(0, 0, 0, 0.75)',
    dark_darker: 'rgba(0, 0, 0, 0.75)'
  },

  border: {
    light: 'rgb(180, 180, 180)',
    dark_lighter: 'rgb(90, 90, 90)',
    dark_darker: 'rgb(90, 90, 90)'
  },

  separator: {
    light: PlatformColor(
      Platform.select({
        ios: 'separator',
        android: '?android:attr/dividerVertical',
        default: 'rgb(180, 180, 180)'
      }),
      'rgb(180, 180, 180)'
    ) as unknown as string,
    dark_lighter: PlatformColor(
      Platform.select({
        ios: 'separator',
        android: '?android:attr/dividerVertical',
        default: 'rgb(90, 90, 90)'
      }),
      'rgb(90, 90, 90)'
    ) as unknown as string,
    dark_darker: PlatformColor(
      Platform.select({
        ios: 'separator',
        android: '?android:attr/dividerVertical',
        default: 'rgb(90, 90, 90)'
      }),
      'rgb(90, 90, 90)'
    ) as unknown as string
  },

  shimmerDefault: {
    light: 'rgba(25, 25, 25, 0.05)',
    dark_lighter: 'rgba(250, 250, 250, 0.05)',
    dark_darker: 'rgba(250, 250, 250, 0.05)'
  },
  shimmerHighlight: {
    light: 'rgba(25, 25, 25, 0.15)',
    dark_lighter: 'rgba(250, 250, 250, 0.15)',
    dark_darker: 'rgba(250, 250, 250, 0.15)'
  }
}

const getColors = (theme: Theme): { [key in ColorDefinitions]: string } => {
  let colors = {} as {
    [key in ColorDefinitions]: string
  }
  const keys = Object.keys(themeColors) as ColorDefinitions[]
  keys.forEach(key => (colors[key] = themeColors[key][theme]))

  return colors
}

const themes = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: themeColors.primaryDefault.light,
      background: themeColors.backgroundDefault.light,
      card: themeColors.backgroundDefault.light,
      text: themeColors.primaryDefault.light,
      border: themeColors.border.light,
      notification: themeColors.red.light
    }
  },
  dark_lighter: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: themeColors.primaryDefault.dark_lighter,
      background: themeColors.backgroundDefault.dark_lighter,
      card: themeColors.backgroundDefault.dark_lighter,
      text: themeColors.primaryDefault.dark_lighter,
      border: themeColors.border.dark_lighter,
      notification: themeColors.red.dark_lighter
    }
  },
  dark_darker: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: themeColors.primaryDefault.dark_darker,
      background: themeColors.backgroundDefault.dark_darker,
      card: themeColors.backgroundDefault.dark_darker,
      text: themeColors.primaryDefault.dark_darker,
      border: themeColors.border.dark_darker,
      notification: themeColors.red.dark_darker
    }
  }
}

export { themeColors, getColors, themes }
