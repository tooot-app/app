import { DefaultTheme, DarkTheme } from '@react-navigation/native'

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
  | 'shimmerDefault'
  | 'shimmerHighlight'

const themeColors: {
  [key in ColorDefinitions]: {
    light: string
    dark: string
  }
} = {
  primaryDefault: {
    light: 'rgb(18, 18, 18)',
    dark: 'rgb(180, 180, 180)'
  },
  primaryOverlay: {
    light: 'rgb(250, 250, 250)',
    dark: 'rgb(200, 200, 200)'
  },
  secondary: {
    light: 'rgb(135, 135, 135)',
    dark: 'rgb(130, 130, 130)'
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
    dark: 'rgb(225, 78, 79)'
  },
  green: {
    light: 'rgb(18, 158, 80)',
    dark: 'rgb(18, 158, 80)'
  },
  yellow: {
    light: 'rgb(230, 166, 30)',
    dark: 'rgb(200, 145, 25)'
  },

  backgroundDefault: {
    light: 'rgb(250, 250, 250)',
    dark: 'rgb(18, 18, 18)'
  },
  backgroundDefaultTransparent: {
    light: 'rgba(250, 250, 250, 0)',
    dark: 'rgba(18, 18, 18, 0)'
  },
  backgroundOverlayDefault: {
    light: 'rgba(250, 250, 250, 0.5)',
    dark: 'rgba(0, 0, 0, 0.5)'
  },
  backgroundOverlayInvert: {
    light: 'rgba(25, 25, 25, 0.5)',
    dark: 'rgba(0, 0, 0, 0.5)'
  },

  border: {
    light: 'rgba(25, 25, 25, 0.3)',
    dark: 'rgba(255, 255, 255, 0.3)'
  },

  shimmerDefault: {
    light: 'rgba(25, 25, 25, 0.05)',
    dark: 'rgba(250, 250, 250, 0.05)'
  },
  shimmerHighlight: {
    light: 'rgba(25, 25, 25, 0.15)',
    dark: 'rgba(250, 250, 250, 0.15)'
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
      primary: themeColors.primaryDefault.light,
      background: themeColors.backgroundDefault.light,
      card: themeColors.backgroundDefault.light,
      text: themeColors.primaryDefault.light,
      border: themeColors.border.light,
      notification: themeColors.red.light
    }
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      primary: themeColors.primaryDefault.dark,
      background: themeColors.backgroundDefault.dark,
      card: themeColors.backgroundDefault.dark,
      text: themeColors.primaryDefault.dark,
      border: themeColors.border.dark,
      notification: themeColors.red.dark
    }
  }
}

export { themeColors, getTheme, themes }
