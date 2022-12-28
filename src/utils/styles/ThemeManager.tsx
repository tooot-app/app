import { useGlobalStorage } from '@utils/storage/actions'
import { StorageGlobal } from '@utils/storage/global'
import { ColorDefinitions, getColors, Theme } from '@utils/styles/themes'
import { throttle } from 'lodash'
import React, { createContext, PropsWithChildren, useContext, useEffect, useState } from 'react'
import { Appearance } from 'react-native'

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
  const [colorScheme, setColorScheme] = React.useState(Appearance.getColorScheme())
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
  userTheme: StorageGlobal['app.theme'],
  darkTheme: StorageGlobal['app.theme.dark']
): 'light' | 'dark_lighter' | 'dark_darker' => {
  enum DarkTheme {
    lighter = 'dark_lighter',
    darker = 'dark_darker'
  }
  const determineDarkTheme = DarkTheme[darkTheme || 'lighter']
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
    default:
      return determineDarkTheme
  }
}

const ThemeManager: React.FC<PropsWithChildren> = ({ children }) => {
  const osTheme = useColorSchemeDelay()
  const [userTheme] = useGlobalStorage.string('app.theme')
  const [darkTheme] = useGlobalStorage.string('app.theme.dark')

  const [mode, setMode] = useState<'light' | 'dark'>(
    userTheme === 'auto' ? osTheme || 'light' : userTheme || 'light'
  )
  const [theme, setTheme] = useState<Theme>(determineTheme(osTheme, userTheme, darkTheme))

  useEffect(() => {
    setMode(userTheme === 'auto' ? osTheme || 'light' : userTheme || 'light')
  }, [osTheme, userTheme])
  useEffect(() => {
    setTheme(determineTheme(osTheme, userTheme, darkTheme))
  }, [osTheme, userTheme, darkTheme])

  return (
    <ManageThemeContext.Provider value={{ mode, theme, colors: getColors(theme) }}>
      {children}
    </ManageThemeContext.Provider>
  )
}

export default ThemeManager
