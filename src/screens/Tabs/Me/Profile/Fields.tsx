import { discardConfirmation } from '@components/discardConfirmation'
import { ComponentEmojis } from '@components/Emojis'
import { EmojisState } from '@components/Emojis/Context'
import { HeaderLeft, HeaderRight } from '@components/Header'
import ComponentInput from '@components/Input'
import CustomText from '@components/Text'
import { TabMeProfileStackScreenProps } from '@utils/navigation/navigators'
import { useProfileMutation } from '@utils/queryHooks/profile'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Dispatch, RefObject, SetStateAction, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, TextInput } from 'react-native'
import FlashMessage from 'react-native-flash-message'

const Field: React.FC<{
  allProps: EmojisState['inputProps']
  setDirty: Dispatch<SetStateAction<boolean>>
  index: number
  field?: Mastodon.Field
}> = ({ allProps, setDirty, index, field }) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  const nameRef = useRef<TextInput>(null)
  const valueRef = useRef<TextInput>(null)
  const [name, setName] = useState(field?.name || '')
  const [value, setValue] = useState(field?.value || '')
  allProps[index * 2] = {
    value: [name, setName],
    selection: useState({ start: name.length }),
    isFocused: useRef<boolean>(false),
    maxLength: 255,
    ref: nameRef
  }
  allProps[index * 2 + 1] = {
    value: [value, setValue],
    selection: useState({ start: value.length }),
    isFocused: useRef<boolean>(false),
    maxLength: 255,
    ref: valueRef
  }

  useEffect(() => {
    setDirty(dirty =>
      dirty ? dirty : (field?.name || '') !== name || (field?.value || '') !== value
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
        {t('screenTabs:me.profile.fields.group', { index: index + 1 })}
      </CustomText>
      <ComponentInput title={t('screenTabs:me.profile.fields.label')} {...allProps[index * 2]} />
      <ComponentInput
        title={t('screenTabs:me.profile.fields.content')}
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
  const { t } = useTranslation(['common'])
  const { mutateAsync, status } = useProfileMutation()

  const allProps: EmojisState['inputProps'] = []

  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderLeft
          content='chevron-left'
          onPress={() => {
            discardConfirmation({
              condition: dirty,
              action: () => navigation.navigate('Tab-Me-Profile-Root')
            })
          }}
        />
      ),
      headerRight: () => (
        <HeaderRight
          disabled={!dirty}
          loading={status === 'loading'}
          content='save'
          onPress={async () => {
            mutateAsync({
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
                    allProps[index * 2]?.value[0].length || allProps[index * 2 + 1]?.value[0].length
                )
                .map(index => ({
                  name: allProps[index * 2].value[0],
                  value: allProps[index * 2 + 1].value[0]
                }))
            }).then(() => {
              navigation.navigate('Tab-Me-Profile-Root')
            })
          }}
        />
      )
    })
  }, [theme, dirty, status, allProps.map(p => p.value)])

  return (
    <ComponentEmojis inputProps={allProps}>
      <ScrollView style={{ paddingHorizontal: StyleConstants.Spacing.Global.PagePadding }}>
        {Array.from(Array(4).keys()).map(index => (
          <Field
            key={index}
            allProps={allProps}
            setDirty={setDirty}
            index={index}
            field={fields?.[index]}
          />
        ))}
      </ScrollView>
    </ComponentEmojis>
  )
}

export default TabMeProfileFields
