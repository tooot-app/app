import React, { createContext, useContext, useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

type ContextType = {
  reduceMotionEnabled: boolean
}

const AccessibilityContext = createContext<ContextType>({
  reduceMotionEnabled: false
})

export const useAccessibility = () => useContext(AccessibilityContext)

const AccessibilityManager: React.FC = ({ children }) => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false)

  const handleReduceMotionChanged = (reduceMotionEnabled: boolean) =>
    setReduceMotionEnabled(reduceMotionEnabled)

  const loadReduceMotion = async () => {
    const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled()
    setReduceMotionEnabled(reduceMotion)
  }

  useEffect(() => {
    loadReduceMotion()

    AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      handleReduceMotionChanged
    )

    return () => {
      AccessibilityInfo.removeEventListener(
        'reduceMotionChanged',
        handleReduceMotionChanged
      )
    }
  }, [])

  return (
    <AccessibilityContext.Provider
      value={{
        reduceMotionEnabled
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export default AccessibilityManager
