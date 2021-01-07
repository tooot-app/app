import haptics from '@components/haptics'
import { ParseEmojis } from '@components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Dispatch, useCallback, useMemo } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import updateText from '../updateText'
import { ComposeAction, ComposeState } from '../utils/types'

const ComposeRootSuggestion = React.memo(
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
      haptics('Light')
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

const styles = StyleSheet.create({
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
  }
})

export default ComposeRootSuggestion
