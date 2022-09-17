import { ComponentEmojis } from '@components/Emojis'
import { EmojisState } from '@components/Emojis/helpers/EmojisContext'
import { HeaderLeft, HeaderRight } from '@components/Header'
import ComponentInput from '@components/Input'
import CustomText from '@components/Text'
import { TabMeProfileStackScreenProps } from '@utils/navigation/navigators'
import { useProfileMutation } from '@utils/queryHooks/profile'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { isEqual } from 'lodash'
import React, { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, TextInput, View } from 'react-native'
import FlashMessage from 'react-native-flash-message'

const Field: React.FC<{
  allProps: EmojisState['inputProps']
  setDirty: Dispatch<SetStateAction<boolean>>
  index: number
  field?: Mastodon.Field
}> = ({ allProps, setDirty, index, field }) => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  const [name, setName] = useState(field?.name || '')
  const [value, setValue] = useState(field?.value || '')
  allProps[index * 2] = {
    ref: useRef<TextInput>(null),
    value: name,
    setValue: setName,
    selectionRange: name ? { start: name.length, end: name.length } : { start: 0, end: 0 },
    maxLength: 255
  }
  allProps[index * 2 + 1] = {
    ref: useRef<TextInput>(null),
    value,
    setValue,
    selectionRange: value ? { start: value.length, end: value.length } : { start: 0, end: 0 },
    maxLength: 255
  }

  useEffect(() => {
    setDirty(dirty =>
      dirty ? dirty : !isEqual(field?.name, name) || !isEqual(field?.value, value)
    )
  }, [name, value])

  return (
    <>
      <CustomText
        fontStyle='S'
        style={{
          marginBottom: StyleConstants.Spacing.XS,
          color: colors.primaryDefault
        }}
      >
        {t('me.profile.fields.group', { index: index + 1 })}
      </CustomText>
      <ComponentInput title={t('me.profile.fields.label')} {...allProps[index * 2]} />
      <ComponentInput
        title={t('me.profile.fields.content')}
        {...allProps[index * 2 + 1]}
        multiline
      />
    </>
  )
}

const TabMeProfileFields: React.FC<
  TabMeProfileStackScreenProps<'Tab-Me-Profile-Fields'> & {
    messageRef: RefObject<FlashMessage>
  }
> = ({
  messageRef,
  route: {
    params: { fields }
  },
  navigation
}) => {
  const { theme } = useTheme()
  const { t, i18n } = useTranslation('screenTabs')
  const { mutateAsync, status } = useProfileMutation()

  const allProps: EmojisState['inputProps'] = []

  const [dirty, setDirty] = useState(false)

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
              type: 'fields_attributes',
              data: Array.from(Array(4).keys())
                .filter(
                  index =>
                    allProps[index * 2]?.value.length || allProps[index * 2 + 1]?.value.length
                )
                .map(index => ({
                  name: allProps[index * 2].value,
                  value: allProps[index * 2 + 1].value
                }))
            }).then(() => {
              navigation.navigate('Tab-Me-Profile-Root')
            })
          }}
        />
      )
    })
  }, [theme, i18n.language, dirty, status, allProps.map(p => p.value)])

  return (
    <ComponentEmojis inputProps={allProps}>
      <View style={{ paddingHorizontal: StyleConstants.Spacing.Global.PagePadding }}>
        {Array.from(Array(4).keys()).map(index => (
          <Field
            key={index}
            allProps={allProps}
            setDirty={setDirty}
            index={index}
            field={fields?.[index]}
          />
        ))}
      </View>
    </ComponentEmojis>
  )
}

export default TabMeProfileFields
