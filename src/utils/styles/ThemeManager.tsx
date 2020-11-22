import React, { createContext, useContext, useEffect, useState } from 'react'
import { Appearance, useColorScheme } from 'react-native-appearance'
import { ColorDefinitions, getTheme } from 'src/utils/styles/themes'

const osTheme = Appearance.getColorScheme() as 'light' | 'dark'

export const ManageThemeContext: React.Context<{
  mode: 'light' | 'dark'
  theme: { [key in ColorDefinitions]: string }
  toggle: () => void
}> = createContext({
  mode: osTheme,
  theme: getTheme(osTheme),
  toggle: () => {}
})

export const useTheme = () => useContext(ManageThemeContext)

const ThemeManager: React.FC = ({ children }) => {
  const [mode, setMode] = useState(osTheme)
  const systemTheme = useColorScheme()

  const toggleTheme = () => {
    mode === 'light' ? setMode('dark') : setMode('light')
  }

  useEffect(() => {
    setMode(systemTheme === 'no-preference' ? 'light' : systemTheme)
  }, [systemTheme])

  return (
    <ManageThemeContext.Provider
      value={{
        mode: mode,
        theme: getTheme(mode),
        toggle: toggleTheme
      }}
    >
      {children}
    </ManageThemeContext.Provider>
  )
}

export default ThemeManager
