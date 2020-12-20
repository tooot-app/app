import { Feather } from '@expo/vector-icons'
import React, { useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'
import client from '@api/client'
import { ButtonRow } from '@components/Button'
import { toast } from '@components/toast'
import relativeTime from '@utils/relativeTime'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'

import Emojis from './Emojis'
import { TimelineData } from '../../Timeline'
import { findIndex } from 'lodash'

const fireMutation = async ({
  id,
  options
}: {
  id: string
  options?: { [key: number]: boolean }
}) => {
  const formData = new FormData()
  options &&
    Object.keys(options).forEach(option => {
      // @ts-ignore
      if (options[option]) {
        formData.append('choices[]', option)
      }
    })

  const res = await client({
    method: options ? 'post' : 'get',
    instance: 'local',
    url: options ? `polls/${id}/votes` : `polls/${id}`,
    ...(options && { body: formData })
  })

  if (res.body.id === id) {
    return Promise.resolve(res.body as Mastodon.Poll)
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
  queryKey: QueryKey.Timeline
  poll: NonNullable<Mastodon.Status['poll']>
  reblog: boolean
  sameAccount: boolean
}

const TimelinePoll: React.FC<Props> = ({
  queryKey,
  poll,
  reblog,
  sameAccount
}) => {
  const { theme } = useTheme()
  const queryClient = useQueryClient()
  const mutation = useMutation(fireMutation, {
    onSuccess: (data, { id }) => {
      queryClient.cancelQueries(queryKey)

      queryClient.setQueryData<TimelineData>(queryKey, old => {
        let tootIndex = -1
        const pageIndex = findIndex(old?.pages, page => {
          const tempIndex = findIndex(page.toots, [
            reblog ? 'reblog.poll.id' : 'poll.id',
            id
          ])
          if (tempIndex >= 0) {
            tootIndex = tempIndex
            return true
          } else {
            return false
          }
        })

        if (pageIndex >= 0 && tootIndex >= 0) {
          if (reblog) {
            old!.pages[pageIndex].toots[tootIndex].reblog!.poll = data
          } else {
            old!.pages[pageIndex].toots[tootIndex].poll = data
          }
        }
        return old
      })
    }
  })

  const pollButton = () => {
    if (!poll.expired) {
      if (!sameAccount && !poll.voted) {
        return (
          <View style={styles.button}>
            <ButtonRow
              onPress={() => {
                if (poll.multiple) {
                  mutation.mutate({ id: poll.id, options: multipleOptions })
                } else {
                  mutation.mutate({ id: poll.id, options: singleOptions })
                }
              }}
              {...(mutation.isLoading ? { icon: 'loader' } : { text: '投票' })}
              disabled={mutation.isLoading}
            />
          </View>
        )
      } else {
        return (
          <View style={styles.button}>
            <ButtonRow
              onPress={() => mutation.mutate({ id: poll.id })}
              {...(mutation.isLoading ? { icon: 'loader' } : { text: '刷新' })}
              disabled={mutation.isLoading}
            />
          </View>
        )
      }
    }
  }

  const pollExpiration = useMemo(() => {
    if (poll.expired) {
      return (
        <Text style={[styles.expiration, { color: theme.secondary }]}>
          投票已结束
        </Text>
      )
    } else {
      return (
        <Text style={[styles.expiration, { color: theme.secondary }]}>
          {relativeTime(poll.expires_at)}截止
        </Text>
      )
    }
  }, [])

  const [singleOptions, setSingleOptions] = useState({
    ...[false, false, false, false].slice(0, poll.options.length)
  })
  const [multipleOptions, setMultipleOptions] = useState({
    ...[false, false, false, false].slice(0, poll.options.length)
  })
  const isSelected = (index: number) => {
    if (poll.multiple) {
      return multipleOptions[index] ? 'check-square' : 'square'
    } else {
      return singleOptions[index] ? 'check-circle' : 'circle'
    }
  }

  return (
    <View style={styles.base}>
      {poll.options.map((option, index) =>
        poll.voted ? (
          <View key={index} style={styles.poll}>
            <View style={styles.optionSelected}>
              <View style={styles.contentSelected}>
                <Emojis
                  content={option.title}
                  emojis={poll.emojis}
                  size={StyleConstants.Font.Size.M}
                  numberOfLines={1}
                />
                {poll.own_votes!.includes(index) && (
                  <Feather
                    style={styles.voted}
                    name={poll.multiple ? 'check-square' : 'check-circle'}
                    size={StyleConstants.Font.Size.M}
                    color={theme.primary}
                  />
                )}
              </View>
              <Text style={[styles.percentage, { color: theme.primary }]}>
                {poll.votes_count
                  ? Math.round((option.votes_count / poll.voters_count) * 100)
                  : 0}
                %
              </Text>
            </View>

            <View
              style={[
                styles.background,
                {
                  width: `${Math.round(
                    (option.votes_count / poll.voters_count) * 100
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
                if (poll.multiple) {
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
                    ].slice(0, poll.options.length)
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
                  emojis={poll.emojis}
                  size={StyleConstants.Font.Size.M}
                />
              </View>
            </Pressable>
          </View>
        )
      )}
      <View style={styles.meta}>
        {pollButton()}
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
    minWidth: 2,
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

export default TimelinePoll
