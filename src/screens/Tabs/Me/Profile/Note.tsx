import { HeaderLeft, HeaderRight } from '@components/Header'
import Input from '@components/Input'
import { TabMeProfileStackScreenProps } from '@utils/navigation/navigators'
import { useProfileMutation } from '@utils/queryHooks/profile'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet, View } from 'react-native'
import FlashMessage from 'react-native-flash-message'
import { ScrollView } from 'react-native-gesture-handler'

const TabMeProfileNote: React.FC<
  TabMeProfileStackScreenProps<'Tab-Me-Profile-Note'> & {
    messageRef: RefObject<FlashMessage>
  }
> = ({
  messageRef,
  route: {
    params: { note }
  },
  navigation
}) => {
  const { theme } = useTheme()
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
            mutateAsync({
              theme,
              messageRef,
              message: {
                text: 'me.profile.root.note.title',
                succeed: true,
                failed: true
              },
              type: 'note',
              data: newNote
            }).then(() => {
              navigation.navigate('Tab-Me-Profile-Root')
            })
          }}
        />
      )
    })
  }, [theme, i18n.language, dirty, status, newNote])

  return (
    <ScrollView style={styles.base} keyboardShouldPersistTaps='always'>
      <View style={{ marginBottom: StyleConstants.Spacing.XL * 2 }}>
        <Input
          value={newNote}
          setValue={setNewNote}
          multiline
          emoji
          options={{ maxLength: 500 }}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: StyleConstants.Spacing.Global.PagePadding
  }
})

export default TabMeProfileNote
