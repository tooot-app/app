import haptics from '@components/haptics'
import { ParseEmojis } from '@components/Parse'
import { emojisFetch } from '@utils/fetches/emojisFetch'
import { searchFetch } from '@utils/fetches/searchFetch'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { forEach, groupBy, sortBy } from 'lodash'
import React, {
  Dispatch,
  useCallback,
  useContext,
  useEffect,
  useMemo
} from 'react'
import {
  View,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  Image
} from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { useQuery } from 'react-query'
import ComposeActions from './Actions'
import ComposeRootFooter from './Root/Footer'
import ComposeRootHeader from './Root/Header'
import updateText from './updateText'
import ComposeContext from './utils/createContext'
import { ComposeAction, ComposeState } from './utils/types'

const ListItem = React.memo(
  ({
    item,
    composeState,
    composeDispatch
  }: {
    item: Mastodon.Account & Mastodon.Tag
    composeState: ComposeState
    composeDispatch: Dispatch<ComposeAction>
  }) => {
    const { theme } = useTheme()
    const onPress = useCallback(() => {
      const focusedInput = composeState.textInputFocus.current
      updateText({
        composeState: {
          ...composeState,
          [focusedInput]: {
            ...composeState[focusedInput],
            selection: {
              start: composeState.tag!.offset,
              end: composeState.tag!.offset + composeState.tag!.text.length + 1
            }
          }
        },
        composeDispatch,
        newText: item.acct ? `@${item.acct}` : `#${item.name}`,
        type: 'suggestion'
      })
      haptics('Success')
    }, [])
    const children = useMemo(
      () =>
        item.acct ? (
          <View style={[styles.account, { borderBottomColor: theme.border }]}>
            <Image source={{ uri: item.avatar }} style={styles.accountAvatar} />
            <View>
              <Text
                style={[styles.accountName, { color: theme.primary }]}
                numberOfLines={1}
              >
                <ParseEmojis
                  content={item.display_name || item.username}
                  emojis={item.emojis}
                  size='S'
                />
              </Text>
              <Text
                style={[styles.accountAccount, { color: theme.primary }]}
                numberOfLines={1}
              >
                @{item.acct}
              </Text>
            </View>
          </View>
        ) : (
          <View style={[styles.hashtag, { borderBottomColor: theme.border }]}>
            <Text style={[styles.hashtagText, { color: theme.primary }]}>
              #{item.name}
            </Text>
          </View>
        ),
      []
    )
    return (
      <Pressable
        onPress={onPress}
        style={styles.suggestion}
        children={children}
      />
    )
  },
  () => true
)

const ComposeRoot: React.FC = () => {
  const { theme } = useTheme()

  const { composeState, composeDispatch } = useContext(ComposeContext)

  const { isFetching, data, refetch } = useQuery(
    [
      'Search',
      {
        type: composeState.tag?.type,
        term: composeState.tag?.text.substring(1)
      }
    ],
    searchFetch,
    { enabled: false }
  )
  useEffect(() => {
    if (composeState.tag?.text) {
      refetch()
    }
  }, [composeState.tag?.text])

  const { data: emojisData } = useQuery(['Emojis'], emojisFetch)
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
      <ListItem
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
        keyboardShouldPersistTaps='handled'
        ListHeaderComponent={ComposeRootHeader}
        ListFooterComponent={ComposeRootFooter}
        ListEmptyComponent={listEmpty}
        data={data as Mastodon.Account[] & Mastodon.Tag[]}
        renderItem={listItem}
        keyExtractor={(item: any) => item.acct || item.name}
      />
      <ComposeActions />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1
  },
  contentView: { flex: 1 },
  suggestion: {
    flex: 1
  },
  account: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: StyleConstants.Spacing.S,
    paddingBottom: StyleConstants.Spacing.S,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginRight: StyleConstants.Spacing.Global.PagePadding,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  accountAvatar: {
    width: StyleConstants.Font.LineHeight.M * 2,
    height: StyleConstants.Font.LineHeight.M * 2,
    marginRight: StyleConstants.Spacing.S,
    borderRadius: StyleConstants.Avatar.M
  },
  accountName: {
    ...StyleConstants.FontStyle.S,
    fontWeight: StyleConstants.Font.Weight.Bold,
    marginBottom: StyleConstants.Spacing.XS
  },
  accountAccount: {
    ...StyleConstants.FontStyle.S
  },
  hashtag: {
    flex: 1,
    paddingTop: StyleConstants.Spacing.S,
    paddingBottom: StyleConstants.Spacing.S,
    marginLeft: StyleConstants.Spacing.Global.PagePadding,
    marginRight: StyleConstants.Spacing.Global.PagePadding,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  hashtagText: {
    ...StyleConstants.FontStyle.S,
    fontWeight: StyleConstants.Font.Weight.Bold,
    marginBottom: StyleConstants.Spacing.XS
  },
  loading: {
    flex: 1,
    alignItems: 'center'
  }
})

export default ComposeRoot
