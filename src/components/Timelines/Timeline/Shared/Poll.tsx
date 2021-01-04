import client from '@api/client'
import Button from '@components/Button'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import relativeTime from '@components/relativeTime'
import { TimelineData } from '@components/Timelines/Timeline'
import { ParseEmojis } from '@root/components/Parse'
import { toast } from '@root/components/toast'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { findIndex } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useMutation, useQueryClient } from 'react-query'

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
  const { t, i18n } = useTranslation('timeline')

  const [allOptions, setAllOptions] = useState(
    new Array(poll.options.length).fill(false)
  )

  const queryClient = useQueryClient()
  const fireMutation = useCallback(
    ({ type }: { type: 'vote' | 'refresh' }) => {
      const formData = new FormData()
      type === 'vote' &&
        allOptions.forEach((o, i) => {
          if (allOptions[i]) {
            formData.append('choices[]', i.toString())
          }
        })

      return client({
        method: type === 'vote' ? 'post' : 'get',
        instance: 'local',
        url: type === 'vote' ? `polls/${poll.id}/votes` : `polls/${poll.id}`,
        ...(type === 'vote' && { body: formData })
      })
    },
    [allOptions]
  )
  const mutation = useMutation(fireMutation, {
    onSuccess: ({ body }) => {
      queryClient.cancelQueries(queryKey)

      queryClient.setQueryData<TimelineData>(queryKey, old => {
        let tootIndex = -1
        const pageIndex = findIndex(old?.pages, page => {
          const tempIndex = findIndex(page.toots, [
            reblog ? 'reblog.poll.id' : 'poll.id',
            poll.id
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
            old!.pages[pageIndex].toots[tootIndex].reblog!.poll = body
          } else {
            old!.pages[pageIndex].toots[tootIndex].poll = body
          }
        }
        return old
      })

      haptics('Success')
    },
    onError: (err: any) => {
      haptics('Error')
      toast({
        type: 'error',
        message: '投票错误',
        ...(err.status &&
          typeof err.status === 'number' &&
          err.data &&
          err.data.error &&
          typeof err.data.error === 'string' && {
            description: err.data.error
          }),
        autoHide: false
      })
      queryClient.invalidateQueries(queryKey)
    }
  })

  const pollButton = useMemo(() => {
    if (!poll.expired) {
      if (!sameAccount && !poll.voted) {
        return (
          <View style={styles.button}>
            <Button
              onPress={() => mutation.mutate({ type: 'vote' })}
              type='text'
              content={t('shared.poll.meta.button.vote')}
              loading={mutation.isLoading}
              disabled={allOptions.filter(o => o !== false).length === 0}
            />
          </View>
        )
      } else {
        return (
          <View style={styles.button}>
            <Button
              onPress={() => mutation.mutate({ type: 'refresh' })}
              type='text'
              content={t('shared.poll.meta.button.refresh')}
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
          {t('shared.poll.meta.expiration.expired')}
        </Text>
      )
    } else {
      return (
        <Text style={[styles.expiration, { color: theme.secondary }]}>
          {t('shared.poll.meta.expiration.until', {
            at: relativeTime(poll.expires_at, i18n.language)
          })}
        </Text>
      )
    }
  }, [mode, poll.expired, poll.expires_at])

  const isSelected = useCallback(
    (index: number): any =>
      allOptions[index]
        ? `Check${poll.multiple ? 'Square' : 'Circle'}`
        : `${poll.multiple ? 'Square' : 'Circle'}`,
    [allOptions]
  )

  const pollBodyDisallow = useMemo(() => {
    return poll.options.map((option, index) => (
      <View key={index} style={styles.optionContainer}>
        <View style={styles.optionContent}>
          <Icon
            style={styles.optionSelection}
            name={
              `${poll.own_votes?.includes(index) ? 'Check' : ''}${
                poll.multiple ? 'Square' : 'Circle'
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
          <Icon
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
          {t('shared.poll.meta.voted', { count: poll.voters_count })}
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
    marginLeft: StyleConstants.Spacing.S,
    flexBasis: '20%',
    textAlign: 'center'
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
