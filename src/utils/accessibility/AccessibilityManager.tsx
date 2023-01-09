import React, {
    createContext,
    PropsWithChildren,
    useContext,
    useEffect,
    useState
} from 'react'
import { AccessibilityInfo } from 'react-native'

type ContextType = {
  reduceMotionEnabled: boolean
  screenReaderEnabled: boolean
  boldTextEnabled: boolean
}

const AccessibilityContext = createContext<ContextType>({
  reduceMotionEnabled: false,
  screenReaderEnabled: false,
  boldTextEnabled: false
})

export const useAccessibility = () => useContext(AccessibilityContext)

const AccessibilityManager: React.FC<PropsWithChildren> = ({ children }) => {
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false)
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false)
  const [boldTextEnabled, setBoldTextEnabled] = useState(false)

  const handleReduceMotionChanged = (reduceMotionEnabled: boolean) =>
    setReduceMotionEnabled(reduceMotionEnabled)

  const handleScreenReaderEnabled = (screenReaderEnabled: boolean) =>
    setScreenReaderEnabled(screenReaderEnabled)

  const handleBoldTextEnabled = (boldTextEnabled: boolean) =>
    setBoldTextEnabled(boldTextEnabled)

  const loadAccessibilityInfo = async () => {
    const reduceMotion = await AccessibilityInfo.isReduceMotionEnabled()
    const screenReader = await AccessibilityInfo.isScreenReaderEnabled()
    const boldText = await AccessibilityInfo.isBoldTextEnabled()
    setReduceMotionEnabled(reduceMotion)
    setScreenReaderEnabled(screenReader)
    setBoldTextEnabled(boldText)
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
    const boldTextSubscription = AccessibilityInfo.addEventListener(
      'boldTextChanged',
      handleBoldTextEnabled
    )

    return () => {
      reduceMotionSubscription.remove()
      screenReaderSubscription.remove()
      boldTextSubscription.remove()
    }
  }, [])

  return (
    <AccessibilityContext.Provider
      value={{ reduceMotionEnabled, screenReaderEnabled, boldTextEnabled }}
    >
      {children}
    </AccessibilityContext.Provider>
  )
}

export default AccessibilityManager
