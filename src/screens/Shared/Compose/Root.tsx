import { forEach, groupBy, sortBy } from 'lodash'
import React, {
  Dispatch,
  RefObject,
  useCallback,
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
import Emojis from 'src/components/Timelines/Timeline/Shared/Emojis'
import { emojisFetch } from 'src/utils/fetches/emojisFetch'
import { searchFetch } from 'src/utils/fetches/searchFetch'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { PostAction, ComposeState } from '../Compose'
import ComposeActions from './Actions'
import ComposeAttachments from './Attachments'
import ComposeEmojis from './Emojis'
import ComposePoll from './Poll'
import ComposeReply from './Reply'
import ComposeSpoilerInput from './SpoilerInput'
import ComposeTextInput from './TextInput'
import updateText from './updateText'
import * as Permissions from 'expo-permissions'

export interface Props {
  composeState: ComposeState
  composeDispatch: Dispatch<PostAction>
}

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
        origin: focusedInput,
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

const ComposeRoot: React.FC<Props> = ({ composeState, composeDispatch }) => {
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

  const listHeader = useMemo(() => {
    return (
      <>
        {composeState.spoiler.active ? (
          <ComposeSpoilerInput
            composeState={composeState}
            composeDispatch={composeDispatch}
          />
        ) : null}
        <ComposeTextInput
          composeState={composeState}
          composeDispatch={composeDispatch}
          textInputRef={textInputRef}
        />
      </>
    )
  }, [composeState.spoiler.active, composeState.text.formatted])

  const listFooterEmojis = useMemo(
    () =>
      composeState.emoji.active && (
        <View style={styles.emojis}>
          <ComposeEmojis
            textInputRef={textInputRef}
            composeState={composeState}
            composeDispatch={composeDispatch}
          />
        </View>
      ),
    [composeState.emoji.active]
  )
  const listFooterAttachments = useMemo(
    () =>
      (composeState.attachments.uploads.length > 0 ||
        composeState.attachmentUploadProgress) && (
        <View style={styles.attachments}>
          <ComposeAttachments
            composeState={composeState}
            composeDispatch={composeDispatch}
          />
        </View>
      ),
    [composeState.attachments.uploads, composeState.attachmentUploadProgress]
  )
  // const listFooterPoll = useMemo(
  //   () =>
  //     composeState.poll.active && (
  //       <View style={styles.poll}>
  //         <ComposePoll
  //           poll={composeState.poll}
  //           composeDispatch={composeDispatch}
  //         />
  //       </View>
  //     ),
  //   [
  //     composeState.poll.active,
  //     composeState.poll.total,
  //     composeState.poll.options['0'],
  //     composeState.poll.options['1'],
  //     composeState.poll.options['2'],
  //     composeState.poll.options['3'],
  //     composeState.poll.multiple,
  //     composeState.poll.expire
  //   ]
  // )
  const listFooterPoll = () =>
    composeState.poll.active && (
      <View style={styles.poll}>
        <ComposePoll
          poll={composeState.poll}
          composeDispatch={composeDispatch}
        />
      </View>
    )
  const listFooterReply = useMemo(
    () =>
      composeState.replyToStatus && (
        <View style={styles.replyTo}>
          <ComposeReply replyToStatus={composeState.replyToStatus} />
        </View>
      ),
    []
  )
  const listFooter = useMemo(() => {
    return (
      <>
        {listFooterEmojis}
        {listFooterAttachments}
        {listFooterPoll()}
        {listFooterReply}
      </>
    )
  }, [
    composeState.emoji.active,
    composeState.attachments.uploads,
    composeState.attachmentUploadProgress,
    composeState.poll.active,
    composeState.poll.total,
    composeState.poll.options['0'],
    composeState.poll.options['1'],
    composeState.poll.options['2'],
    composeState.poll.options['3'],
    composeState.poll.multiple,
    composeState.poll.expire
  ])

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
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        data={data}
        keyExtractor={listKey}
        renderItem={listItem}
      />
      <ComposeActions
        textInputRef={textInputRef}
        composeState={composeState}
        composeDispatch={composeDispatch}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1
  },
  contentView: { flex: 1 },

  attachments: {
    flex: 1
  },
  poll: {
    flex: 1,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  replyTo: {
    flex: 1,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
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
  },
  emojis: {
    flex: 1
  }
})

export default ComposeRoot
