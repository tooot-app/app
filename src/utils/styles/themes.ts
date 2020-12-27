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
  | 'shimmer'

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
    light: 'rgba(18, 18, 18, 0.3)',
    dark: 'rgba(255, 255, 255, 0.3)'
  },
  shimmer: {
    light: [
      'rgba(18, 18, 18, 0.05)',
      'rgba(18, 18, 18, 0.15)',
      'rgba(18, 18, 18, 0.05)'
    ],
    dark: [
      'rgba(250, 250, 250, 0.05)',
      'rgba(250, 250, 250, 0.15)',
      'rgba(250, 250, 250, 0.05)'
    ]
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
      card: themeColors.background.light,
      text: themeColors.primary.light,
      border: themeColors.border.light,
      notification: themeColors.red.light
    }
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: themeColors.primary.dark,
      background: themeColors.background.dark,
      card: themeColors.background.dark,
      text: themeColors.primary.dark,
      border: themeColors.border.dark,
      notification: themeColors.red.dark
    }
  }
}

export { themeColors, getTheme, themes }
