import { DefaultTheme, DarkTheme } from '@react-navigation/native'

export type ColorDefinitions =
  | 'primary'
  | 'primaryOverlay'
  | 'secondary'
  | 'disabled'
  | 'background'
  | 'backgroundGradientStart'
  | 'backgroundGradientEnd'
  | 'backgroundOverlay'
  | 'link'
  | 'border'
  | 'separator'
  | 'success'
  | 'error'
  | 'warning'

const themeColors: {
  [key in ColorDefinitions]: {
    light: string
    dark: string
  }
} = {
  primary: {
    light: 'rgb(0, 0, 0)',
    dark: 'rgb(255, 255, 255)'
  },
  primaryOverlay: {
    light: 'rgb(255, 255, 255)',
    dark: 'rgb(0, 0, 0)'
  },
  secondary: {
    light: 'rgb(153, 153, 153)',
    dark: 'rgb(117, 117, 117)'
  },
  disabled: {
    light: 'rgb(229, 229, 234)',
    dark: 'rgb(44, 44, 46)'
  },
  background: {
    light: 'rgb(255, 255, 255)',
    dark: 'rgb(0, 0, 0)'
  },
  backgroundGradientStart: {
    light: 'rgba(255, 255, 255, 0.5)',
    dark: 'rgba(0, 0, 0, 0.5)'
  },
  backgroundGradientEnd: {
    light: 'rgba(255, 255, 255, 1)',
    dark: 'rgba(0, 0, 0, 1)'
  },
  backgroundOverlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgb(255, 255, 255, 0.5)'
  },
  link: {
    light: 'rgb(0, 122, 255)',
    dark: 'rgb(10, 132, 255)'
  },
  border: {
    light: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(255, 255, 255, 0.16)'
  },
  separator: {
    light: 'rgba(0, 0, 0, 0.1)',
    dark: 'rgba(255, 255, 255, 0.1)'
  },
  success: {
    light: 'rgb(52, 199, 89)',
    dark: 'rgb(48, 209, 88)'
  },
  error: {
    light: 'rgb(255, 59, 48)',
    dark: 'rgb(255, 69, 58)'
  },
  warning: {
    light: 'rgb(255, 149, 0)',
    dark: 'rgb(255, 159, 10)'
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
