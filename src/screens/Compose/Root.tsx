import ComponentSeparator from '@components/Separator'
import { useEmojisQuery } from '@utils/queryHooks/emojis'
import { useSearchQuery } from '@utils/queryHooks/search'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { forEach, groupBy, sortBy } from 'lodash'
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { FlatList, StyleSheet, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import ComposeActions from './Root/Actions'
import ComposePosting from './Posting'
import ComposeRootFooter from './Root/Footer'
import ComposeRootHeader from './Root/Header'
import ComposeRootSuggestion from './Root/Suggestion'
import ComposeContext from './utils/createContext'
import ComposeDrafts from './Root/Drafts'
import FastImage from 'react-native-fast-image'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'

const prefetchEmojis = (
  sortedEmojis: { title: string; data: Mastodon.Emoji[] }[],
  reduceMotionEnabled: boolean
) => {
  const prefetches: { uri: string }[] = []
  let requestedIndex = 0
  sortedEmojis.forEach(sorted => {
    sorted.data.forEach(emoji => {
      if (requestedIndex > 40) {
        return
      }
      prefetches.push({
        uri: reduceMotionEnabled ? emoji.static_url : emoji.url
      })
      requestedIndex++
    })
  })
  FastImage.preload(prefetches)
}

const ComposeRoot = React.memo(
  () => {
    const { reduceMotionEnabled } = useAccessibility()
    const { theme } = useTheme()

    const { composeState, composeDispatch } = useContext(ComposeContext)

    const { isFetching, data, refetch } = useSearchQuery({
      type:
        composeState.tag?.type === 'accounts' ||
        composeState.tag?.type === 'hashtags'
          ? composeState.tag.type
          : undefined,
      term: composeState.tag?.text.substring(1),
      options: { enabled: false }
    })

    useEffect(() => {
      if (
        (composeState.tag?.type === 'accounts' ||
          composeState.tag?.type === 'hashtags') &&
        composeState.tag?.text
      ) {
        refetch()
      }
    }, [composeState.tag])

    const { data: emojisData } = useEmojisQuery({})
    useEffect(() => {
      if (emojisData && emojisData.length) {
        let sortedEmojis: { title: string; data: Mastodon.Emoji[] }[] = []
        forEach(
          groupBy(sortBy(emojisData, ['category', 'shortcode']), 'category'),
          (value, key) => sortedEmojis.push({ title: key, data: value })
        )
        composeDispatch({
          type: 'emoji',
          payload: { ...composeState.emoji, emojis: sortedEmojis }
        })
        prefetchEmojis(sortedEmojis, reduceMotionEnabled)
      }
    }, [emojisData, reduceMotionEnabled])

    const listEmpty = useMemo(() => {
      if (isFetching) {
        return (
          <View key='listEmpty' style={styles.loading}>
            <Circle
              size={StyleConstants.Font.Size.M * 1.25}
              color={theme.secondary}
            />
          </View>
        )
      }
    }, [isFetching])

    const listItem = useCallback(
      ({ item }) => (
        <ComposeRootSuggestion
          item={item}
          composeState={composeState}
          composeDispatch={composeDispatch}
        />
      ),
      [composeState]
    )

    return (
      <View style={styles.base}>
        <FlatList
          renderItem={listItem}
          ListEmptyComponent={listEmpty}
          keyboardShouldPersistTaps='always'
          ListHeaderComponent={ComposeRootHeader}
          ListFooterComponent={ComposeRootFooter}
          ItemSeparatorComponent={ComponentSeparator}
          // @ts-ignore
          data={data ? data[composeState.tag?.type] : undefined}
          keyExtractor={() => Math.random().toString()}
        />
        <ComposeActions />
        <ComposeDrafts />
        <ComposePosting />
      </View>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    flex: 1
  },
  contentView: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center'
  }
})

export default ComposeRoot
