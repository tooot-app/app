import client from '@api/client'
import Button from '@components/Button'
import haptics from '@components/haptics'
import relativeTime from '@components/relativeTime'
import { TimelineData } from '@components/Timelines/Timeline'
import { Feather } from '@expo/vector-icons'
import { ParseEmojis } from '@root/components/Parse'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { findIndex } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'

const fireMutation = async ({
  id,
  options
}: {
  id: string
  options?: boolean[]
}) => {
  const formData = new FormData()
  options &&
    options.forEach((o, i) => {
      if (options[i]) {
        formData.append('choices[]', i.toString())
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
  const { mode, theme } = useTheme()
  const queryClient = useQueryClient()

  const [allOptions, setAllOptions] = useState(
    new Array(poll.options.length).fill(false)
  )

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

      haptics('Success')
    },
    onError: () => {
      haptics('Error')
    }
  })

  const pollButton = useMemo(() => {
    if (!poll.expired) {
      if (!sameAccount && !poll.voted) {
        return (
          <View style={styles.button}>
            <Button
              onPress={() =>
                mutation.mutate({ id: poll.id, options: allOptions })
              }
              type='text'
              content='投票'
              loading={mutation.isLoading}
              disabled={allOptions.filter(o => o !== false).length === 0}
            />
          </View>
        )
      } else {
        return (
          <View style={styles.button}>
            <Button
              onPress={() => mutation.mutate({ id: poll.id })}
              {...(mutation.isLoading ? { icon: 'loader' } : { text: '刷新' })}
              type='text'
              content='刷新'
              loading={mutation.isLoading}
            />
          </View>
        )
      }
    }
  }, [poll.expired, poll.voted, allOptions, mutation.isLoading])

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
  }, [mode])

  const isSelected = useCallback(
    (index: number): any =>
      allOptions[index]
        ? `check-${poll.multiple ? 'square' : 'circle'}`
        : `${poll.multiple ? 'square' : 'circle'}`,
    [allOptions]
  )

  const pollBodyDisallow = useMemo(() => {
    return poll.options.map((option, index) => (
      <View key={index} style={styles.optionContainer}>
        <View style={styles.optionContent}>
          <Feather
            style={styles.optionSelection}
            name={
              `${poll.own_votes?.includes(index) ? 'check-' : ''}${
                poll.multiple ? 'square' : 'circle'
              }` as any
            }
            size={StyleConstants.Font.Size.M}
            color={
              poll.own_votes?.includes(index) ? theme.primary : theme.disabled
            }
          />
          <Text style={styles.optionText}>
            <ParseEmojis content={option.title} emojis={poll.emojis} />
          </Text>
          <Text style={[styles.optionPercentage, { color: theme.primary }]}>
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
              backgroundColor: theme.disabled
            }
          ]}
        />
      </View>
    ))
  }, [mode, poll.options])
  const pollBodyAllow = useMemo(() => {
    return poll.options.map((option, index) => (
      <Pressable
        key={index}
        style={styles.optionContainer}
        onPress={() => {
          haptics('Light')
          if (poll.multiple) {
            setAllOptions(allOptions.map((o, i) => (i === index ? !o : o)))
          } else {
            {
              const otherOptions =
                allOptions[index] === false ? false : undefined
              setAllOptions(
                allOptions.map((o, i) =>
                  i === index
                    ? !o
                    : otherOptions !== undefined
                    ? otherOptions
                    : o
                )
              )
            }
          }
        }}
      >
        <View style={[styles.optionContent]}>
          <Feather
            style={styles.optionSelection}
            name={isSelected(index)}
            size={StyleConstants.Font.Size.L}
            color={theme.primary}
          />
          <Text style={styles.optionText}>
            <ParseEmojis content={option.title} emojis={poll.emojis} />
          </Text>
        </View>
      </Pressable>
    ))
  }, [mode, allOptions])

  return (
    <View style={styles.base}>
      {poll.expired || poll.voted ? pollBodyDisallow : pollBodyAllow}
      <View style={styles.meta}>
        {pollButton}
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
  optionContainer: {
    flex: 1,
    paddingVertical: StyleConstants.Spacing.S
  },
  optionContent: {
    flex: 1,
    flexDirection: 'row'
  },
  optionText: {
    flex: 1
  },
  optionSelection: {
    marginRight: StyleConstants.Spacing.S
  },
  optionPercentage: {
    ...StyleConstants.FontStyle.M,
    alignSelf: 'center',
    marginLeft: StyleConstants.Spacing.S
  },
  background: {
    height: StyleConstants.Spacing.XS,
    minWidth: 2,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    marginTop: StyleConstants.Spacing.XS,
    marginBottom: StyleConstants.Spacing.S
  },
  meta: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: StyleConstants.Spacing.XS
  },
  button: {
    marginRight: StyleConstants.Spacing.S
  },
  votes: {
    ...StyleConstants.FontStyle.S
  },
  expiration: {
    ...StyleConstants.FontStyle.S
  }
})

export default TimelinePoll
