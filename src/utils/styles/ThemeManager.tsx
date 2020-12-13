import React, { createContext, useContext, useEffect, useState } from 'react'
import { useColorScheme } from 'react-native-appearance'
import { useSelector } from 'react-redux'
import { ColorDefinitions, getTheme } from '@utils/styles/themes'
import { getSettingsTheme } from '@utils/slices/settingsSlice'

type ContextType = {
  mode: 'light' | 'dark'
  theme: { [key in ColorDefinitions]: string }
  setTheme: (theme: 'light' | 'dark') => void
}

export const ManageThemeContext = createContext<ContextType>({
  mode: 'light',
  theme: getTheme('light'),
  setTheme: () => {}
})

export const useTheme = () => useContext(ManageThemeContext)

const ThemeManager: React.FC = ({ children }) => {
  const osTheme = useColorScheme()
  const userTheme = useSelector(getSettingsTheme)
  const currentMode =
    userTheme === 'auto' ? (osTheme as 'light' | 'dark') : userTheme

  const [mode, setMode] = useState(currentMode)

  const setTheme = (theme: 'light' | 'dark') => setMode(theme)

  useEffect(() => {
    setMode(currentMode)
  }, [currentMode])

  return (
    <ManageThemeContext.Provider
      value={{
        mode: mode,
        theme: getTheme(mode),
        setTheme: setTheme
      }}
    >
      {children}
    </ManageThemeContext.Provider>
  )
}

export default ThemeManager
