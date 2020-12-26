import { DefaultTheme, DarkTheme } from '@react-navigation/native'

export type ColorDefinitions =
  | 'primary'
  | 'primaryOverlay'
  | 'secondary'
  | 'disabled'
  | 'blue'
  | 'red'
  | 'background'
  | 'backgroundGradientStart'
  | 'backgroundGradientEnd'
  | 'backgroundOverlay'
  | 'border'
  | 'separator'

const themeColors: {
  [key in ColorDefinitions]: {
    light: string
    dark: string
  }
} = {
  primary: {
    light: 'rgb(18, 18, 18)',
    dark: 'rgb(218, 218, 218)'
  },
  primaryOverlay: {
    light: 'rgb(250, 250, 250)',
    dark: 'rgb(218, 218, 218)'
  },
  secondary: {
    light: 'rgb(135, 135, 135)',
    dark: 'rgb(135, 135, 135)'
  },
  disabled: {
    light: 'rgb(200, 200, 200)',
    dark: 'rgb(66, 66, 66)'
  },
  blue: {
    light: 'rgb(43, 144, 221)',
    dark: 'rgb(43, 144, 221)'
  },
  red: {
    light: 'rgb(225, 45, 35)',
    dark: 'rgb(225, 98, 89)'
  },

  background: {
    light: 'rgb(250, 250, 250)',
    dark: 'rgb(18, 18, 18)'
  },
  backgroundGradientStart: {
    light: 'rgba(250, 250, 250, 0.5)',
    dark: 'rgba(18, 18, 18, 0.5)'
  },
  backgroundGradientEnd: {
    light: 'rgba(250, 250, 250, 1)',
    dark: 'rgba(18, 18, 18, 1)'
  },
  backgroundOverlay: {
    light: 'rgba(18, 18, 18, 0.5)',
    dark: 'rgba(0, 0, 0, 0.5)'
  },
  border: {
    light: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(255, 255, 255, 0.16)'
  },
  separator: {
    light: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(255, 255, 255, 0.1)'
  }
}

const getTheme = (mode: 'light' | 'dark') => {
  let Theme = {} as {
    [key in ColorDefinitions]: string
  }
  const keys = Object.keys(themeColors) as ColorDefinitions[]
  keys.forEach(key => (Theme[key] = themeColors[key][mode]))

  return Theme
}

const themes = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: themeColors.primary.light,
      background: themeColors.background.light,
      card: themeColors.background.light || 'rgba(249, 249, 249, 0.94)',
      text: themeColors.primary.light,
      border: themeColors.border.light,
      notification: 'rgb(255, 59, 48)'
    }
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: themeColors.primary.dark,
      background: themeColors.background.dark,
      card: themeColors.background.dark || 'rgba(22, 22, 22, 0.94)',
      text: themeColors.primary.dark,
      border: themeColors.border.dark,
      notification: 'rgb(255, 69, 58)'
    }
  }
}

export { themeColors, getTheme, themes }
