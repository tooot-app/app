import { HeaderLeft, HeaderRight } from '@components/Header'
import Input from '@components/Input'
import { TabMeProfileStackScreenProps } from '@utils/navigation/navigators'
import { useProfileMutation } from '@utils/queryHooks/profile'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { RefObject, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet } from 'react-native'
import FlashMessage from 'react-native-flash-message'
import { ScrollView } from 'react-native-gesture-handler'

const TabMeProfileName: React.FC<
  TabMeProfileStackScreenProps<'Tab-Me-Profile-Name'> & {
    messageRef: RefObject<FlashMessage>
  }
> = ({
  messageRef,
  route: {
    params: { display_name }
  },
  navigation
}) => {
  const { mode } = useTheme()
  const { t, i18n } = useTranslation('screenTabs')
  const { mutateAsync, status } = useProfileMutation()

  const [displayName, setDisplayName] = useState(display_name)

  const [dirty, setDirty] = useState(false)
  useEffect(() => {
    setDirty(display_name !== displayName)
  }, [displayName])

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
              mode,
              messageRef,
              message: {
                text: 'me.profile.root.name.title',
                succeed: true,
                failed: true
              },
              type: 'display_name',
              data: displayName
            }).then(() => {
              navigation.navigate('Tab-Me-Profile-Root')
            })
          }}
        />
      )
    })
  }, [mode, i18n.language, dirty, status, displayName])

  return (
    <ScrollView style={styles.base} keyboardShouldPersistTaps='always'>
      <Input
        value={displayName}
        setValue={setDisplayName}
        emoji
        options={{
          maxLength: 30,
          autoCapitalize: 'none',
          autoComplete: 'username',
          textContentType: 'username',
          autoCorrect: false
        }}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: StyleConstants.Spacing.Global.PagePadding
  }
})

export default TabMeProfileName
