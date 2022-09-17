import EmojisButton from '@components/Emojis/Button'
import EmojisList from '@components/Emojis/List'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { useEmojisQuery } from '@utils/queryHooks/emojis'
import { getInstanceFrequentEmojis } from '@utils/slices/instancesSlice'
import { chunk, forEach, groupBy, sortBy } from 'lodash'
import React, { PropsWithChildren, RefObject, useEffect, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, KeyboardAvoidingView, Text, TextInput, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { ScrollView } from 'react-native-gesture-handler'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import EmojisContext, { emojisReducer, EmojisState } from './Emojis/helpers/EmojisContext'

const prefetchEmojis = (
  sortedEmojis: {
    title: string
    data: Pick<Mastodon.Emoji, 'shortcode' | 'url' | 'static_url'>[][]
  }[],
  reduceMotionEnabled: boolean
) => {
  const prefetches: { uri: string }[] = []
  let requestedIndex = 0
  sortedEmojis.forEach(sorted => {
    sorted.data.forEach(emojis =>
      emojis.forEach(emoji => {
        if (requestedIndex > 40) {
          return
        }
        prefetches.push({
          uri: reduceMotionEnabled ? emoji.static_url : emoji.url
        })
        requestedIndex++
      })
    )
  })
  try {
    FastImage.preload(prefetches)
  } catch {}
}

export type Props = {
  inputProps: EmojisState['inputProps']
  focusRef?: RefObject<TextInput>
}

const ComponentEmojis: React.FC<Props & PropsWithChildren> = ({
  children,
  inputProps,
  focusRef
}) => {
  const { reduceMotionEnabled } = useAccessibility()

  const [emojisState, emojisDispatch] = useReducer(emojisReducer, {
    emojis: [],
    targetProps: null,
    inputProps
  })
  useEffect(() => {
    emojisDispatch({ type: 'input', payload: inputProps })
  }, [inputProps])

  const { t } = useTranslation()
  const { data } = useEmojisQuery({})
  const frequentEmojis = useSelector(getInstanceFrequentEmojis, () => true)
  useEffect(() => {
    if (data && data.length) {
      let sortedEmojis: {
        title: string
        data: Pick<Mastodon.Emoji, 'shortcode' | 'url' | 'static_url'>[][]
      }[] = []
      forEach(groupBy(sortBy(data, ['category', 'shortcode']), 'category'), (value, key) =>
        sortedEmojis.push({ title: key, data: chunk(value, 5) })
      )
      if (frequentEmojis.length) {
        sortedEmojis.unshift({
          title: t('componentEmojis:frequentUsed'),
          data: chunk(
            frequentEmojis.map(e => e.emoji),
            5
          )
        })
      }
      emojisDispatch({ type: 'load', payload: sortedEmojis })
      prefetchEmojis(sortedEmojis, reduceMotionEnabled)
    }
  }, [data, reduceMotionEnabled])

  const insets = useSafeAreaInsets()
  const [keyboardShown, setKeyboardShown] = useState(false)
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
      emojisDispatch({ type: 'target', payload: null })
      setKeyboardShown(true)
    })
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardShown(false)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])
  useEffect(() => {
    if (focusRef) {
      setTimeout(() => focusRef.current?.focus(), 500)
    }
  }, [])

  return (
    <KeyboardAvoidingView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <View style={{ flex: 1, justifyContent: 'space-between' }}>
          <EmojisContext.Provider value={{ emojisState, emojisDispatch }}>
            <ScrollView keyboardShouldPersistTaps='always' children={children} />
            <View
              style={[
                keyboardShown
                  ? {
                      position: 'absolute',
                      bottom: 0,
                      width: '100%'
                    }
                  : null,
                { marginBottom: keyboardShown ? insets.bottom : 0 }
              ]}
              children={keyboardShown ? <EmojisButton /> : <EmojisList />}
            />
          </EmojisContext.Provider>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export { ComponentEmojis, EmojisButton, EmojisList }
