import { useEmojisQuery } from '@utils/queryHooks/emojis'
import { useSearchQuery } from '@utils/queryHooks/search'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { forEach, groupBy, sortBy } from 'lodash'
import React, { useCallback, useContext, useEffect, useMemo } from 'react'
import { View, FlatList, StyleSheet } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import ComposeActions from './Actions'
import ComposePosting from './Posting'
import ComposeRootFooter from './Root/Footer'
import ComposeRootHeader from './Root/Header'
import ComposeRootSuggestion from './Root/Suggestion'
import ComposeContext from './utils/createContext'

const ComposeRoot: React.FC = () => {
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
    }
  }, [emojisData])

  const listEmpty = useMemo(() => {
    if (isFetching) {
      return (
        <View key='listEmpty' style={styles.loading}>
          <Chase
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
        keyboardShouldPersistTaps='handled'
        ListHeaderComponent={ComposeRootHeader}
        ListFooterComponent={ComposeRootFooter}
        // @ts-ignore
        data={data ? data[composeState.tag?.type] : undefined}
        keyExtractor={({ item }) => item.acct || item.name}
      />
      <ComposeActions />
      <ComposePosting />
    </View>
  )
}

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
