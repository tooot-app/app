import EmojisButton from '@components/Emojis/Button'
import EmojisList from '@components/Emojis/List'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { useEmojisQuery } from '@utils/queryHooks/emojis'
import { getInstanceFrequentEmojis } from '@utils/slices/instancesSlice'
import { chunk, forEach, groupBy, sortBy } from 'lodash'
import React, { createRef, PropsWithChildren, useEffect, useReducer, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Keyboard, KeyboardAvoidingView, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'
import EmojisContext, { Emojis, emojisReducer, EmojisState } from './Emojis/helpers/EmojisContext'

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
  customButton?: boolean
  customEdges?: Edge[]
  customBehavior?: 'height' | 'padding' | 'position'
}

export const emojis: Emojis = createRef()

const ComponentEmojis: React.FC<Props & PropsWithChildren> = ({
  children,
  inputProps,
  customButton = false,
  customEdges = ['bottom'],
  customBehavior
}) => {
  const { reduceMotionEnabled } = useAccessibility()

  const [emojisState, emojisDispatch] = useReducer(emojisReducer, { inputProps, targetIndex: -1 })
  useEffect(() => {
    emojisDispatch({ type: 'input', payload: inputProps })
  }, [inputProps])

  const { t } = useTranslation()
  const { data } = useEmojisQuery({})
  const frequentEmojis = useSelector(getInstanceFrequentEmojis, () => true)
  useEffect(() => {
    if (data && data.length) {
      let sortedEmojis: NonNullable<Emojis['current']> = []
      forEach(groupBy(sortBy(data, ['category', 'shortcode']), 'category'), (value, key) =>
        sortedEmojis.push({ title: key, data: chunk(value, 5) })
      )
      if (frequentEmojis.length) {
        sortedEmojis.unshift({
          title: t('componentEmojis:frequentUsed'),
          data: chunk(
            frequentEmojis.map(e => e.emoji),
            5
          ),
          type: 'frequent'
        })
      }
      emojis.current = sortedEmojis
      prefetchEmojis(sortedEmojis, reduceMotionEnabled)
    }
  }, [data, reduceMotionEnabled])

  const insets = useSafeAreaInsets()
  const [keyboardShown, setKeyboardShown] = useState(false)
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardWillShow', () => {
      const anyInputHasFocus = inputProps.filter(props => props.isFocused.current).length
      if (anyInputHasFocus) {
        emojisDispatch({ type: 'target', payload: -1 })
      }
      setKeyboardShown(true)
    })
    const hideSubscription = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardShown(false)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [inputProps])

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={customBehavior}>
      <SafeAreaView style={{ flex: 1 }} edges={customEdges}>
        <View style={{ flex: 1 }}>
          <EmojisContext.Provider value={{ emojisState, emojisDispatch }}>
            {children}
            <View
              style={[
                { position: 'absolute', bottom: 0, width: '100%' },
                {
                  marginBottom: keyboardShown && emojisState.targetIndex === -1 ? insets.bottom : 0
                }
              ]}
              children={
                emojisState.targetIndex !== -1 ? (
                  <EmojisList />
                ) : customButton ? null : (
                  <EmojisButton />
                )
              }
            />
          </EmojisContext.Provider>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

export { ComponentEmojis, EmojisButton, EmojisList }
