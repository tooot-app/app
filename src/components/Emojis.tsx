import EmojisButton from '@components/Emojis/Button'
import EmojisList from '@components/Emojis/List'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { useEmojisQuery } from '@utils/queryHooks/emojis'
import { chunk, forEach, groupBy, sortBy } from 'lodash'
import React, {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useReducer
} from 'react'
import FastImage from 'react-native-fast-image'
import EmojisContext, { emojisReducer } from './Emojis/helpers/EmojisContext'

const prefetchEmojis = (
  sortedEmojis: { title: string; data: Mastodon.Emoji[][] }[],
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

export interface Props {
  enabled?: boolean
  value?: string
  setValue:
    | Dispatch<SetStateAction<string | undefined>>
    | Dispatch<SetStateAction<string>>
  selectionRange: MutableRefObject<{
    start: number
    end: number
  }>
  maxLength?: number
}

const ComponentEmojis: React.FC<Props> = ({
  enabled = false,
  value,
  setValue,
  selectionRange,
  maxLength,
  children
}) => {
  const { reduceMotionEnabled } = useAccessibility()

  const [emojisState, emojisDispatch] = useReducer(emojisReducer, {
    enabled,
    active: false,
    emojis: [],
    shortcode: null
  })

  useEffect(() => {
    if (emojisState.shortcode) {
      addEmoji(emojisState.shortcode)
      emojisDispatch({
        type: 'shortcode',
        payload: null
      })
    }
  }, [emojisState.shortcode])

  const addEmoji = useCallback(
    (emojiShortcode: string) => {
      if (value?.length) {
        const contentFront = value.slice(0, selectionRange.current?.start)
        const contentRear = value.slice(selectionRange.current?.end)

        const whiteSpaceRear = /\s/g.test(contentRear.slice(-1))

        const newTextWithSpace = ` ${emojiShortcode}${
          whiteSpaceRear ? '' : ' '
        }`
        setValue(
          [contentFront, newTextWithSpace, contentRear]
            .join('')
            .slice(0, maxLength)
        )
      } else {
        setValue(`${emojiShortcode} `.slice(0, maxLength))
      }
    },
    [value, selectionRange.current?.start, selectionRange.current?.end]
  )

  const { data } = useEmojisQuery({ options: { enabled } })
  useEffect(() => {
    if (data && data.length) {
      let sortedEmojis: { title: string; data: Mastodon.Emoji[][] }[] = []
      forEach(
        groupBy(sortBy(data, ['category', 'shortcode']), 'category'),
        (value, key) => sortedEmojis.push({ title: key, data: chunk(value, 5) })
      )
      emojisDispatch({
        type: 'load',
        payload: sortedEmojis
      })
      prefetchEmojis(sortedEmojis, reduceMotionEnabled)
    }
  }, [data, reduceMotionEnabled])

  return (
    <EmojisContext.Provider
      value={{ emojisState, emojisDispatch }}
      children={children}
    />
  )
}

export { ComponentEmojis, EmojisButton, EmojisList }
