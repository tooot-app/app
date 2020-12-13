import { forEach, groupBy, sortBy } from 'lodash'
import React, {
  Dispatch,
  RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react'
import {
  View,
  ActivityIndicator,
  FlatList,
  Pressable,
  ProgressViewIOS,
  StyleSheet,
  Text,
  TextInput,
  Image
} from 'react-native'
import { useQuery } from 'react-query'
import Emojis from '@components/Timelines/Timeline/Shared/Emojis'
import { emojisFetch } from '@utils/fetches/emojisFetch'
import { searchFetch } from '@utils/fetches/searchFetch'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import {
  PostAction,
  ComposeState,
  ComposeContext
} from '@screens/Shared/Compose'
import ComposeActions from '@screens/Shared/Compose/Actions'
import updateText from './updateText'
import * as Permissions from 'expo-permissions'
import ComposeRootFooter from '@screens/Shared/Compose/Root/Footer'
import ComposeRootHeader from '@screens/Shared/Compose/Root/Header'

const ListItem = React.memo(
  ({
    item,
    composeState,
    composeDispatch,
    textInputRef
  }: {
    item: Mastodon.Account & Mastodon.Tag
    composeState: ComposeState
    composeDispatch: Dispatch<PostAction>
    textInputRef: RefObject<TextInput>
  }) => {
    const { theme } = useTheme()
    const onPress = useCallback(() => {
      const focusedInput = textInputRef.current?.isFocused()
        ? 'text'
        : 'spoiler'
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
    }, [])
    const children = useMemo(
      () =>
        item.acct ? (
          <View style={[styles.account, { borderBottomColor: theme.border }]}>
            <Image source={{ uri: item.avatar }} style={styles.accountAvatar} />
            <View>
              <Text style={[styles.accountName, { color: theme.primary }]}>
                {item.emojis?.length ? (
                  <Emojis
                    content={item.display_name || item.username}
                    emojis={item.emojis}
                    size={StyleConstants.Font.Size.S}
                  />
                ) : (
                  item.display_name || item.username
                )}
              </Text>
              <Text style={[styles.accountAccount, { color: theme.primary }]}>
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
        key={item.url}
        onPress={onPress}
        style={styles.suggestion}
        children={children}
      />
    )
  },
  () => true
)

const ComposeRoot: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)

  const { isFetching, isSuccess, data, refetch } = useQuery(
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

  useEffect(() => {
    ;(async () => {
      Permissions.askAsync(Permissions.CAMERA)
      // const permissionGaleery = await ImagePicker.requestCameraRollPermissionsAsync()
      // if (permissionGaleery.status !== 'granted') {
      //   alert('Sorry, we need camera roll permissions to make this work!')
      // }
      // const permissionCamera = await ImagePicker.requestCameraPermissionsAsync()
      // if (permissionCamera.status !== 'granted') {
      //   alert('Sorry, we need camera roll permissions to make this work!')
      // }
    })()
  }, [])

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

  const textInputRef = useRef<TextInput>(null)

  const listEmpty = useMemo(() => {
    if (isFetching) {
      return <ActivityIndicator />
    }
  }, [isFetching])

  const listKey = useCallback(
    (item: Mastodon.Account | Mastodon.Tag) => item.url,
    [isSuccess]
  )
  const listItem = useCallback(
    ({ item }) =>
      isSuccess ? (
        <ListItem
          item={item}
          composeState={composeState}
          composeDispatch={composeDispatch}
          textInputRef={textInputRef}
        />
      ) : null,
    [isSuccess]
  )
  return (
    <View style={styles.base}>
      <ProgressViewIOS
        progress={composeState.attachmentUploadProgress?.progress || 0}
        progressViewStyle='bar'
      />
      <FlatList
        keyboardShouldPersistTaps='handled'
        ListHeaderComponent={<ComposeRootHeader />}
        ListFooterComponent={<ComposeRootFooter textInputRef={textInputRef} />}
        ListEmptyComponent={listEmpty}
        data={data}
        keyExtractor={listKey}
        renderItem={listItem}
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
    borderRadius: StyleConstants.Avatar.S
  },
  accountName: {
    fontSize: StyleConstants.Font.Size.S,
    fontWeight: StyleConstants.Font.Weight.Bold,
    marginBottom: StyleConstants.Spacing.XS
  },
  accountAccount: {
    fontSize: StyleConstants.Font.Size.S
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
    fontSize: StyleConstants.Font.Size.S,
    fontWeight: StyleConstants.Font.Weight.Bold,
    marginBottom: StyleConstants.Spacing.XS
  }
})

export default ComposeRoot
