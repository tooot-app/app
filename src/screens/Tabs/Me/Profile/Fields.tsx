import { HeaderLeft, HeaderRight } from '@components/Header'
import Input from '@components/Input'
import { displayMessage } from '@components/Message'
import { StackScreenProps } from '@react-navigation/stack'
import { useProfileMutation } from '@utils/queryHooks/profile'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { isEqual } from 'lodash'
import React, { RefObject, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet, Text, View } from 'react-native'
import FlashMessage from 'react-native-flash-message'
import { ScrollView } from 'react-native-gesture-handler'

const prepareFields = (
  fields: Mastodon.Field[] | undefined
): Mastodon.Field[] => {
  return Array.from(Array(4).keys()).map(index => {
    if (fields && fields[index]) {
      return fields[index]
    } else {
      return { name: '', value: '', verified_at: null }
    }
  })
}

const TabMeProfileFields: React.FC<StackScreenProps<
  Nav.TabMeProfileStackParamList,
  'Tab-Me-Profile-Fields'
> & { messageRef: RefObject<FlashMessage> }> = ({
  messageRef,
  route: {
    params: { fields }
  },
  navigation
}) => {
  const { mode, theme } = useTheme()
  const { t, i18n } = useTranslation('screenTabs')
  const { mutateAsync, status } = useProfileMutation()

  const [newFields, setNewFields] = useState(prepareFields(fields))

  const [dirty, setDirty] = useState(false)
  useEffect(() => {
    setDirty(!isEqual(prepareFields(fields), newFields))
  }, [newFields])

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
              type: 'fields_attributes',
              data: newFields
                .filter(field => field.name.length && field.value.length)
                .map(field => ({ name: field.name, value: field.value }))
            })
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
              .catch(err => {
                displayMessage({
                  ref: messageRef,
                  message: t('me.profile.feedback.failed', {
                    type: t('me.profile.root.note.title')
                  }),
                  ...(err && { description: err }),
                  mode,
                  type: 'error'
                })
              })
          }}
        />
      )
    })
  }, [mode, i18n.language, dirty, status, newFields])

  return (
    <ScrollView style={styles.base} keyboardShouldPersistTaps='always'>
      <View style={{ marginBottom: StyleConstants.Spacing.L * 2 }}>
        {Array.from(Array(4).keys()).map(index => (
          <View key={index} style={styles.group}>
            <Text style={[styles.headline, { color: theme.primaryDefault }]}>
              {t('me.profile.fields.group', { index: index + 1 })}
            </Text>
            <Input
              title={t('me.profile.fields.label')}
              autoFocus={false}
              options={{ maxLength: 255 }}
              value={newFields[index].name}
              setValue={(v: any) =>
                setNewFields(
                  newFields.map((field, i) =>
                    i === index ? { ...field, name: v } : field
                  )
                )
              }
              emoji
            />
            <Input
              title={t('me.profile.fields.content')}
              autoFocus={false}
              options={{ maxLength: 255 }}
              value={newFields[index].value}
              setValue={(v: any) =>
                setNewFields(
                  newFields.map((field, i) =>
                    i === index ? { ...field, value: v } : field
                  )
                )
              }
              emoji
            />
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
    marginBottom: StyleConstants.Spacing.L
  },
  group: {
    marginBottom: StyleConstants.Spacing.M
  },
  headline: {
    ...StyleConstants.FontStyle.S,
    marginBottom: StyleConstants.Spacing.XS
  }
})

export default TabMeProfileFields
