import { forEach, groupBy, sortBy } from 'lodash'
import React, { Dispatch, useEffect, useMemo, useRef } from 'react'
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
import ComposeSpoilerInput from './SpoilerInput'
import ComposeTextInput from './TextInput'
import updateText from './updateText'
import * as Permissions from 'expo-permissions'

export interface Props {
  composeState: ComposeState
  composeDispatch: Dispatch<PostAction>
}

const ComposeRoot: React.FC<Props> = ({ composeState, composeDispatch }) => {
  const { theme } = useTheme()

  const { isFetching, isSuccess, data, refetch } = useQuery(
    [
      'Search',
      { type: composeState.tag?.type, term: composeState.tag?.text.substring(1) }
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

  return (
    <View style={styles.base}>
      <ProgressViewIOS
        progress={composeState.attachmentUploadProgress?.progress || 0}
        progressViewStyle='bar'
      />
      <FlatList
        keyboardShouldPersistTaps='handled'
        ListHeaderComponent={
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
        }
        ListFooterComponent={
          <>
            {composeState.emoji.active && (
              <View style={styles.emojis}>
                <ComposeEmojis
                  textInputRef={textInputRef}
                  composeState={composeState}
                  composeDispatch={composeDispatch}
                />
              </View>
            )}

            {(composeState.attachments.uploads.length > 0 ||
              composeState.attachmentUploadProgress) && (
              <View style={styles.attachments}>
                <ComposeAttachments
                  composeState={composeState}
                  composeDispatch={composeDispatch}
                />
              </View>
            )}

            {composeState.poll.active && (
              <View style={styles.poll}>
                <ComposePoll
                  composeState={composeState}
                  composeDispatch={composeDispatch}
                />
              </View>
            )}
          </>
        }
        ListEmptyComponent={listEmpty}
        data={composeState.tag && isSuccess ? data[composeState.tag.type] : []}
        renderItem={({ item, index }) => (
          <Pressable
            key={index}
            onPress={() => {
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
                      end:
                        composeState.tag!.offset + composeState.tag!.text.length + 1
                    }
                  }
                },
                composeDispatch,
                newText: item.acct ? `@${item.acct}` : `#${item.name}`,
                type: 'suggestion'
              })
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
