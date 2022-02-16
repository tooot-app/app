import React, { createContext, useContext, useEffect, useState } from 'react'
import { Appearance } from 'react-native'
import { useSelector } from 'react-redux'
import { ColorDefinitions, getColors, Theme } from '@utils/styles/themes'
import {
  getSettingsDarkTheme,
  getSettingsTheme,
  SettingsState
} from '@utils/slices/settingsSlice'
import { throttle } from 'lodash'

type ContextType = {
  mode: 'light' | 'dark'
  theme: Theme
  colors: { [key in ColorDefinitions]: string }
}

const ManageThemeContext = createContext<ContextType>({
  mode: 'light',
  theme: 'light',
  colors: getColors('light')
})

export const useTheme = () => useContext(ManageThemeContext)

const useColorSchemeDelay = (delay = 500) => {
  const [colorScheme, setColorScheme] = React.useState(
    Appearance.getColorScheme()
  )
  const onColorSchemeChange = React.useCallback(
    throttle(
      ({ colorScheme }) => {
        setColorScheme(colorScheme)
      },
      delay,
      {
        leading: false
      }
    ),
    []
  )
  React.useEffect(() => {
    const listener = Appearance.addChangeListener(onColorSchemeChange)
    return () => {
      onColorSchemeChange.cancel()
      listener.remove()
    }
  }, [])
  return colorScheme
}

const determineTheme = (
  osTheme: 'light' | 'dark' | null | undefined,
  userTheme: SettingsState['theme'],
  darkTheme: SettingsState['darkTheme']
): 'light' | 'dark_lighter' | 'dark_darker' => {
  enum DarkTheme {
    lighter = 'dark_lighter',
    darker = 'dark_darker'
  }
  const determineDarkTheme = DarkTheme[darkTheme]
  switch (userTheme) {
    case 'auto':
      switch (osTheme) {
        case 'dark':
          return determineDarkTheme
        default:
          return 'light'
      }
    case 'light':
      return 'light'
    case 'dark':
      return determineDarkTheme
  }
}

const ThemeManager: React.FC = ({ children }) => {
  const osTheme = useColorSchemeDelay()
  const userTheme = useSelector(getSettingsTheme)
  const darkTheme = useSelector(getSettingsDarkTheme)

  const [mode, setMode] = useState(
    userTheme === 'auto' ? osTheme || 'light' : userTheme
  )
  const [theme, setTheme] = useState<Theme>(
    determineTheme(osTheme, userTheme, darkTheme)
  )

  useEffect(() => {
    setMode(userTheme === 'auto' ? osTheme || 'light' : userTheme)
  }, [osTheme, userTheme])
  useEffect(() => {
    setTheme(determineTheme(osTheme, userTheme, darkTheme))
  }, [osTheme, userTheme, darkTheme])

  return (
    <ManageThemeContext.Provider
      value={{ mode, theme, colors: getColors(theme) }}
    >
      {children}
    </ManageThemeContext.Provider>
  )
}

export default ThemeManager
