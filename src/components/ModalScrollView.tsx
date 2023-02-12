import { useHeaderHeight } from '@react-navigation/elements'
import { StyleConstants } from '@utils/styles/constants'
import { ForwardedRef, forwardRef, PropsWithChildren } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export const ModalScrollView = forwardRef(
  ({ children }: PropsWithChildren, ref: ForwardedRef<ScrollView>) => {
    const headerHeight = useHeaderHeight()

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={headerHeight}
      >
        <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
          <ScrollView
            ref={ref}
            keyboardShouldPersistTaps='always'
            contentContainerStyle={{ padding: StyleConstants.Spacing.Global.PagePadding }}
          >
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    )
  }
)
