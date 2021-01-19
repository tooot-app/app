import ComponentInstance from '@components/Instance'
import React from 'react'
import { KeyboardAvoidingView, Platform } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

const ScreenMeUpdateRemote: React.FC = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView keyboardShouldPersistTaps='handled'>
        <ComponentInstance type='remote' disableHeaderImage />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default ScreenMeUpdateRemote
