import React, { createContext, useContext, useEffect, useState } from 'react'
import { AccessibilityInfo } from 'react-native'

type ContextType = {
  reduceMotionEnabled: boolean
  screenReaderEnabled: boolean
}

const AccessibilityContext = createContext<ContextType>({
  reduceMotionEnabled: false,
  screenReaderEnabled: false
})

export const useAccessibility = () => useContext(AccessibilityContext)

const AccessibilityManager: React.FC = ({ children }) => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false)
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false)

  const handleReduceMotionChanged = (reduceMotionEnabled: boolean) =>
    setReduceMotionEnabled(reduceMotionEnabled)

  const handleScreenReaderEnabled = (screenReaderEnabled: boolean) =>
    setScreenReaderEnabled(screenReaderEnabled)

  const loadAccessibilityInfo = async () => {
    const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled()
    const screenReader = await AccessibilityInfo.isScreenReaderEnabled()
    setReduceMotionEnabled(reduceMotion)
    setScreenReaderEnabled(screenReader)
  }

  useEffect(() => {
    loadAccessibilityInfo()

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      handleReduceMotionChanged
    )
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      handleScreenReaderEnabled
    )

    return () => {
      reduceMotionSubscription.remove()
      screenReaderSubscription.remove()
    }
  }, [])

  return (
    <AccessibilityContext.Provider
      value={{ reduceMotionEnabled, screenReaderEnabled }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export default AccessibilityManager
