import { Feather } from '@expo/vector-icons'
import React, { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useMutation, useQueryCache } from 'react-query'
import client from '@api/client'
import { ButtonRow } from '@components/Button'
import { toast } from '@components/toast'
import relativeTime from '@utils/relativeTime'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

import Emojis from './Emojis'

const fireMutation = async ({
  id,
  options
}: {
  id: string
  options: { [key: number]: boolean }
}) => {
  const formData = new FormData()
  Object.keys(options).forEach(option => {
    // @ts-ignore
    if (options[option]) {
      formData.append('choices[]', option)
    }
  })

  const res = await client({
    method: 'post',
    instance: 'local',
    url: `polls/${id}/votes`,
    body: formData
  })

  if (res.body.id === id) {
    toast({ type: 'success', content: '投票成功成功' })
    return Promise.resolve()
  } else {
    toast({
      type: 'error',
      content: '投票失败，请重试',
      autoHide: false
    })
    return Promise.reject()
  }
}

export interface Props {
  queryKey: App.QueryKey
  status: Mastodon.Status
}

const TimelinePoll: React.FC<Props> = ({ queryKey, status: { poll } }) => {
  const { theme } = useTheme()

  const queryCache = useQueryCache()
  const [mutateAction] = useMutation(fireMutation, {
    onMutate: ({ id, options }) => {
      queryCache.cancelQueries(queryKey)
      const oldData = queryCache.getQueryData(queryKey)

      queryCache.setQueryData(queryKey, old =>
        (old as {}[]).map((paging: any) => ({
          toots: paging.toots.map((toot: any) => {
            if (toot.poll?.id === id) {
              const poll = toot.poll
              const myVotes = Object.keys(options).filter(
                // @ts-ignore
                option => options[option]
              )
              const myVotesInt = myVotes.map(option => parseInt(option))

              toot.poll = {
                ...toot.poll,
                votes_count: poll.votes_count
                  ? poll.votes_count + myVotes.length
                  : myVotes.length,
                voters_count: poll.voters_count ? poll.voters_count + 1 : 1,
                voted: true,
                own_votes: myVotesInt,
                // @ts-ignore
                options: poll.options.map((o, i) => {
                  if (myVotesInt.includes(i)) {
                    o.votes_count = o.votes_count + 1
                  }
                  return o
                })
              }
            }
            return toot
          }),
          pointer: paging.pointer
        }))
      )

      return oldData
    },
    onError: (err, _, oldData) => {
      toast({ type: 'error', content: '请重试' })
      queryCache.setQueryData(queryKey, oldData)
    }
  })

  const pollExpiration = useMemo(() => {
    // how many voted
    if (poll!.expired) {
      return (
        <Text style={[styles.expiration, { color: theme.secondary }]}>
          投票已结束
        </Text>
      )
    } else {
      return (
        <Text style={[styles.expiration, { color: theme.secondary }]}>
          {relativeTime(poll!.expires_at)}截止
        </Text>
      )
    }
  }, [])

  const [singleOptions, setSingleOptions] = useState({
    ...[false, false, false, false].slice(0, poll!.options.length)
  })
  const [multipleOptions, setMultipleOptions] = useState({
    ...[false, false, false, false].slice(0, poll!.options.length)
  })
  const isSelected = (index: number) => {
    if (poll!.multiple) {
      return multipleOptions[index] ? 'check-square' : 'square'
    } else {
      return singleOptions[index] ? 'check-circle' : 'circle'
    }
  }

  return (
    <View style={styles.base}>
      {poll!.options.map((option, index) =>
        poll!.voted ? (
          <View key={index} style={styles.poll}>
            <View style={styles.optionSelected}>
              <View style={styles.contentSelected}>
                <Emojis
                  content={option.title}
                  emojis={poll!.emojis}
                  size={StyleConstants.Font.Size.M}
                  numberOfLines={1}
                />
                {poll!.own_votes!.includes(index) && (
                  <Feather
                    style={styles.voted}
                    name={poll!.multiple ? 'check-square' : 'check-circle'}
                    size={StyleConstants.Font.Size.M}
                    color={theme.primary}
                  />
                )}
              </View>
              <Text style={[styles.percentage, { color: theme.primary }]}>
                {Math.round((option.votes_count / poll!.votes_count) * 100)}%
              </Text>
            </View>

            <View
              style={[
                styles.background,
                {
                  width: `${Math.round(
                    (option.votes_count / poll!.votes_count) * 100
                  )}%`,
                  backgroundColor: theme.border
                }
              ]}
            />
          </View>
        ) : (
          <View key={index} style={styles.poll}>
            <Pressable
              style={[styles.optionUnselected]}
              onPress={() => {
                if (poll!.multiple) {
                  setMultipleOptions({
                    ...multipleOptions,
                    [index]: !multipleOptions[index]
                  })
                } else {
                  setSingleOptions({
                    ...[
                      index === 0,
                      index === 1,
                      index === 2,
                      index === 3
                    ].slice(0, poll!.options.length)
                  })
                }
              }}
            >
              <Feather
                style={styles.votedNot}
                name={isSelected(index)}
                size={StyleConstants.Font.Size.L}
                color={theme.primary}
              />
              <View style={styles.contentUnselected}>
                <Emojis
                  content={option.title}
                  emojis={poll!.emojis}
                  size={StyleConstants.Font.Size.M}
                />
              </View>
            </Pressable>
          </View>
        )
      )}
      <View style={styles.meta}>
        {!poll.expired && !poll.own_votes?.length && (
          <View style={styles.button}>
            <ButtonRow
              onPress={() => {
                if (poll.multiple) {
                  mutateAction({ id: poll.id, options: multipleOptions })
                } else {
                  mutateAction({ id: poll.id, options: singleOptions })
                }
              }}
              text='投票'
            />
          </View>
        )}
        <Text style={[styles.votes, { color: theme.secondary }]}>
          已投{poll.voters_count || 0}人{' • '}
        </Text>
        {pollExpiration}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    marginTop: StyleConstants.Spacing.M
  },
  poll: {
    minHeight: StyleConstants.Font.LineHeight.M * 1.5,
    marginBottom: StyleConstants.Spacing.XS
  },
  optionSelected: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: StyleConstants.Spacing.M,
    paddingRight: StyleConstants.Spacing.M
  },
  optionUnselected: {
    flex: 1,
    flexDirection: 'row'
  },
  contentSelected: {
    flexBasis: '80%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  contentUnselected: {
    flexBasis: '90%'
  },
  voted: {
    marginLeft: StyleConstants.Spacing.S
  },
  votedNot: {
    marginRight: StyleConstants.Spacing.S
  },
  percentage: {
    fontSize: StyleConstants.Font.Size.M
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    minWidth: 1,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: StyleConstants.Spacing.XS
  },
  button: {
    marginRight: StyleConstants.Spacing.M
  },
  votes: {
    fontSize: StyleConstants.Font.Size.S
  },
  expiration: {
    fontSize: StyleConstants.Font.Size.S
  }
})

export default React.memo(
  TimelinePoll,
  (prev, next) => prev.status.poll.voted === next.status.poll.voted
)
