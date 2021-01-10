import ComponentInstance from '@components/Instance'
import React from 'react'
import { KeyboardAvoidingView } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

const UpdateRemote: React.FC = () => {
  return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps='handled'>
        <ComponentInstance type='remote' disableHeaderImage />
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default UpdateRemote
