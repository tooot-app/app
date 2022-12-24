import { EmojisState } from '@components/Emojis/helpers/EmojisContext'
import haptics from '@components/haptics'
import { HeaderCenter, HeaderLeft, HeaderRight } from '@components/Header'
import ComponentInput from '@components/Input'
import { displayMessage, Message } from '@components/Message'
import Selections from '@components/Selections'
import CustomText from '@components/Text'
import { CommonActions } from '@react-navigation/native'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyLists, useListsMutation } from '@utils/queryHooks/lists'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform, ScrollView, TextInput } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'

const TabMeListEdit: React.FC<TabMeStackScreenProps<'Tab-Me-List-Edit'>> = ({
  navigation,
  route: { params }
}) => {
  const { colors, theme } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  const messageRef = useRef(null)

  const queryKeyLists: QueryKeyLists = ['Lists']
  const queryClient = useQueryClient()
  const mutation = useListsMutation({
    onSuccess: res => {
      haptics('Success')
      queryClient.refetchQueries(queryKeyLists)
      navigation.pop(1)
      if (params.type === 'edit') {
        navigation.dispatch({
          ...CommonActions.setParams(res),
          source: params.key
        })
      }
    },
    onError: () => {
      displayMessage({
        ref: messageRef,
        type: 'danger',
        message: t('common:message.error.message', {
          function:
            params.type === 'add'
              ? t('screenTabs:me.stacks.listAdd.name')
              : t('screenTabs:me.stacks.listEdit.name')
        })
      })
    }
  })

  const ref = useRef<TextInput>(null)
  const [title, setTitle] = useState(params.type === 'edit' ? params.payload.title : '')
  const inputProps: EmojisState['inputProps'][0] = {
    ref,
    value: [title, setTitle],
    selection: useState({ start: title.length }),
    isFocused: useRef<boolean>(false),
    maxLength: 50
  }

  const [options, setOptions] = useState<
    { id: 'none' | 'list' | 'followed'; content: string; selected: boolean }[]
  >([
    {
      id: 'none',
      content: t('screenTabs:me.listEdit.repliesPolicy.options.none'),
      selected: params.type === 'edit' ? params.payload.replies_policy === 'none' : false
    },
    {
      id: 'list',
      content: t('screenTabs:me.listEdit.repliesPolicy.options.list'),
      selected: params.type === 'edit' ? params.payload.replies_policy === 'list' : true
    },
    {
      id: 'followed',
      content: t('screenTabs:me.listEdit.repliesPolicy.options.followed'),
      selected: params.type === 'edit' ? params.payload.replies_policy === 'followed' : false
    }
  ])

  useEffect(() => {
    navigation.setOptions({
      title:
        params.type === 'add'
          ? t('screenTabs:me.stacks.listAdd.name')
          : t('screenTabs:me.stacks.listEdit.name'),
      headerLeft: () => (
        <HeaderLeft
          content='X'
          onPress={() => {
            if (params.type === 'edit' ? params.payload.title !== title : title.length) {
              Alert.alert(t('common:discard.title'), t('common:discard.message'), [
                {
                  text: t('common:buttons.discard'),
                  style: 'destructive',
                  onPress: () => navigation.pop(1)
                },
                {
                  text: t('common:buttons.cancel'),
                  style: 'default'
                }
              ])
            } else {
              navigation.pop(1)
            }
          }}
        />
      ),
      headerRight: () => (
        <HeaderRight
          content='Save'
          disabled={!title.length}
          loading={mutation.isLoading}
          onPress={() => {
            switch (params.type) {
              case 'add':
                mutation.mutate({
                  type: 'add',
                  payload: {
                    title,
                    replies_policy: options.find(option => option.selected)?.id || 'list'
                  }
                })
                break
              case 'edit':
                mutation.mutate({
                  type: 'edit',
                  payload: {
                    id: params.payload.id,
                    title,
                    replies_policy: options.find(option => option.selected)?.id || 'list'
                  }
                })
                break
            }
          }}
        />
      )
    })
  }, [title.length, options])

  return (
    <ScrollView style={{ paddingHorizontal: StyleConstants.Spacing.Global.PagePadding }}>
      <ComponentInput {...inputProps} autoFocus title={t('screenTabs:me.listEdit.title')} />

      <CustomText
        fontStyle='M'
        fontWeight='Bold'
        style={{
          color: colors.primaryDefault,
          marginBottom: StyleConstants.Spacing.XS,
          marginTop: StyleConstants.Spacing.M
        }}
      >
        {t('screenTabs:me.listEdit.repliesPolicy.heading')}
      </CustomText>
      <Selections options={options} setOptions={setOptions} />

      <Message ref={messageRef} />
    </ScrollView>
  )
}

export default TabMeListEdit
