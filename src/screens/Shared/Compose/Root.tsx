import ImagePicker from 'expo-image-picker'
import { forEach, groupBy, sortBy } from 'lodash'
import React, { Dispatch, useEffect, useMemo, useRef } from 'react'
import {
  View,
  ActivityIndicator,
  FlatList,
  Pressable,
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
import { PostAction, PostState } from '../Compose'
import ComposeActions from './Actions'
import ComposeAttachments from './Attachments'
import ComposeEmojis from './Emojis'
import ComposePoll from './Poll'
import ComposeTextInput from './TextInput'
import updateText from './updateText'

export interface Props {
  postState: PostState
  postDispatch: Dispatch<PostAction>
}

const ComposeRoot: React.FC<Props> = ({ postState, postDispatch }) => {
  const { theme } = useTheme()

  const { isFetching, isSuccess, data, refetch } = useQuery(
    [
      'Search',
      { type: postState.tag?.type, term: postState.tag?.text.substring(1) }
    ],
    searchFetch,
    { enabled: false }
  )
  useEffect(() => {
    if (postState.tag?.text) {
      refetch()
    }
  }, [postState.tag?.text])

  useEffect(() => {
    ;(async () => {
      const { status } = await ImagePicker.requestCameraRollPermissionsAsync()
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!')
      }
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
      postDispatch({
        type: 'emoji',
        payload: { ...postState.emoji, emojis: sortedEmojis }
      })
    }
  }, [emojisData])

  const textInputRef = useRef<TextInput>(null)

  const listFooter = useMemo(() => {
    return (
      <>
        {postState.emoji.active && (
          <View style={styles.emojis}>
            <ComposeEmojis
              textInputRef={textInputRef}
              postState={postState}
              postDispatch={postDispatch}
            />
          </View>
        )}

        {postState.attachments.length > 0 && (
          <View style={styles.attachments}>
            <ComposeAttachments
              postState={postState}
              postDispatch={postDispatch}
            />
          </View>
        )}
        {postState.poll.active && (
          <View style={styles.poll}>
            <ComposePoll postState={postState} postDispatch={postDispatch} />
          </View>
        )}
      </>
    )
  }, [
    postState.emoji.active,
    postState.attachments.length,
    postState.poll.active
  ])

  const listEmpty = useMemo(() => {
    if (isFetching) {
      return <ActivityIndicator />
    }
  }, [isFetching])

  return (
    <View style={styles.base}>
      <FlatList
        ListHeaderComponent={
          <ComposeTextInput
            postState={postState}
            postDispatch={postDispatch}
            textInputRef={textInputRef}
          />
        }
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        data={postState.tag && isSuccess ? data[postState.tag.type] : []}
        renderItem={({ item, index }) => (
          <Pressable
            key={index}
            onPress={() => {
              updateText({
                postState: {
                  ...postState,
                  selection: {
                    start: postState.tag!.offset,
                    end: postState.tag!.offset + postState.tag!.text.length + 1
                  }
                },
                postDispatch,
                newText: item.acct ? `@${item.acct}` : `#${item.name}`,
                type: 'suggestion'
              })
              textInputRef.current?.focus()
            }}
            style={styles.suggestion}
          >
            {item.acct ? (
              <View
                style={[
                  styles.account,
                  { borderBottomColor: theme.border },
                  index === 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.border
                  }
                ]}
              >
                <Image
                  source={{ uri: item.avatar }}
                  style={styles.accountAvatar}
                />
                <View>
                  <Text style={[styles.accountName, { color: theme.primary }]}>
                    {item.emojis.length ? (
                      <Emojis
                        content={item.display_name || item.username}
                        emojis={item.emojis}
                        size={StyleConstants.Font.Size.S}
                      />
                    ) : (
                      item.display_name || item.username
                    )}
                  </Text>
                  <Text
                    style={[styles.accountAccount, { color: theme.primary }]}
                  >
                    @{item.acct}
                  </Text>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.hashtag,
                  { borderBottomColor: theme.border },
                  index === 0 && {
                    borderTopWidth: StyleSheet.hairlineWidth,
                    borderTopColor: theme.border
                  }
                ]}
              >
                <Text style={[styles.hashtagText, { color: theme.primary }]}>
                  #{item.name}
                </Text>
              </View>
            )}
          </Pressable>
        )}
      />
      <ComposeActions
        textInputRef={textInputRef}
        postState={postState}
        postDispatch={postDispatch}
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
    flex: 1,
    height: 100
  },
  poll: {
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
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding,
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
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding,
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
