import { HeaderLeft, HeaderRight } from '@components/Header'
import Input from '@components/Input'
import { displayMessage } from '@components/Message'
import { StackScreenProps } from '@react-navigation/stack'
import { useProfileMutation } from '@utils/queryHooks/profile'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet } from 'react-native'
import FlashMessage from 'react-native-flash-message'
import { ScrollView } from 'react-native-gesture-handler'

const ScreenMeProfileNote: React.FC<StackScreenProps<
  Nav.TabMeProfileStackParamList,
  'Tab-Me-Profile-Note'
> & { messageRef: RefObject<FlashMessage> }> = ({
  messageRef,
  route: {
    params: { note }
  },
  navigation
}) => {
  const { mode } = useTheme()
  const { t, i18n } = useTranslation('screenTabs')
  const { mutateAsync, status } = useProfileMutation()

  const [newNote, setNewNote] = useState(note)

  const [dirty, setDirty] = useState(false)
  useEffect(() => {
    setDirty(note !== newNote)
  }, [newNote])

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderLeft
          onPress={() => {
            if (dirty) {
              Alert.alert(
                t('me.profile.cancellation.title'),
                t('me.profile.cancellation.message'),
                [
                  {
                    text: t('me.profile.cancellation.buttons.cancel'),
                    style: 'default'
                  },
                  {
                    text: t('me.profile.cancellation.buttons.discard'),
                    style: 'destructive',
                    onPress: () => navigation.navigate('Tab-Me-Profile-Root')
                  }
                ]
              )
            } else {
              navigation.navigate('Tab-Me-Profile-Root')
            }
          }}
        />
      ),
      headerRight: () => (
        <HeaderRight
          disabled={!dirty}
          loading={status === 'loading'}
          content='Save'
          onPress={async () => {
            mutateAsync({ type: 'note', data: newNote })
              .then(() => {
                navigation.navigate('Tab-Me-Profile-Root')
                displayMessage({
                  ref: messageRef,
                  message: t('me.profile.feedback.succeed', {
                    type: t('me.profile.root.note.title')
                  }),
                  mode,
                  type: 'success'
                })
              })
              .catch(() => {
                displayMessage({
                  ref: messageRef,
                  message: t('me.profile.feedback.failed', {
                    type: t('me.profile.root.note.title')
                  }),
                  mode,
                  type: 'error'
                })
              })
          }}
        />
      )
    })
  }, [mode, i18n.language, dirty, status, newNote])

  return (
    <ScrollView style={styles.base} keyboardShouldPersistTaps='handled'>
      <Input value={newNote} setValue={setNewNote} multiline emoji />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  base: {
    padding: StyleConstants.Spacing.Global.PagePadding
  }
})

export default ScreenMeProfileNote
