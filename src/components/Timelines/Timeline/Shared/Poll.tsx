import Button from '@components/Button'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { ParseEmojis } from '@components/Parse'
import RelativeTime from '@components/RelativeTime'
import { toast } from '@components/toast'
import {
  MutationVarsTimelineUpdateStatusProperty,
  QueryKeyTimeline,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { maxBy } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useQueryClient } from 'react-query'

export interface Props {
  queryKey: QueryKeyTimeline
  statusId: Mastodon.Status['id']
  poll: NonNullable<Mastodon.Status['poll']>
  reblog: boolean
  sameAccount: boolean
}

const TimelinePoll: React.FC<Props> = ({
  queryKey,
  statusId,
  poll,
  reblog,
  sameAccount
}) => {
  const { mode, theme } = useTheme()
  const { t } = useTranslation('componentTimeline')

  const [allOptions, setAllOptions] = useState(
    new Array(poll.options.length).fill(false)
  )

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    queryClient,
    onSuccess: true,
    onError: (err: any, params) => {
      const theParams = params as MutationVarsTimelineUpdateStatusProperty
      haptics('Error')
      toast({
        type: 'error',
        message: t('common:toastMessage.error.message', {
          function: t(`shared.poll.meta.button.${theParams.payload.type}`)
        }),
        ...(err.status &&
          typeof err.status === 'number' &&
          err.data &&
          err.data.error &&
          typeof err.data.error === 'string' && {
            description: err.data.error
          })
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
              onPress={() =>
                mutation.mutate({
                  type: 'updateStatusProperty',
                  queryKey,
                  id: statusId,
                  reblog,
                  payload: {
                    property: 'poll',
                    id: poll.id,
                    type: 'vote',
                    options: allOptions
                  }
                })
              }
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
              onPress={() =>
                mutation.mutate({
                  type: 'updateStatusProperty',
                  queryKey,
                  id: statusId,
                  reblog,
                  payload: {
                    property: 'poll',
                    id: poll.id,
                    type: 'refresh'
                  }
                })
              }
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
          <Trans
            i18nKey='componentTimeline:shared.poll.meta.expiration.until'
            components={[<RelativeTime date={poll.expires_at} />]}
          />
        </Text>
      )
    }
  }, [mode, poll.expired, poll.expires_at])

  const isSelected = useCallback(
    (index: number): string =>
      allOptions[index]
        ? `Check${poll.multiple ? 'Square' : 'Circle'}`
        : `${poll.multiple ? 'Square' : 'Circle'}`,
    [allOptions]
  )

  const pollBodyDisallow = useMemo(() => {
    const maxValue = maxBy(poll.options, option => option.votes_count)
      ?.votes_count
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
              poll.own_votes?.includes(index) ? theme.blue : theme.disabled
            }
          />
          <Text style={styles.optionText}>
            <ParseEmojis content={option.title} emojis={poll.emojis} />
          </Text>
          <Text style={[styles.optionPercentage, { color: theme.primary }]}>
            {poll.votes_count
              ? Math.round(
                  (option.votes_count /
                    (poll.voters_count || poll.votes_count)) *
                    100
                )
              : 0}
            %
          </Text>
        </View>

        <View
          style={[
            styles.background,
            {
              width: `${Math.round(
                (option.votes_count / (poll.voters_count || poll.votes_count)) *
                  100
              )}%`,
              backgroundColor:
                option.votes_count === maxValue ? theme.blue : theme.disabled
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
            size={StyleConstants.Font.Size.M}
            color={theme.primary}
          />
          <Text style={styles.optionText}>
            <ParseEmojis content={option.title} emojis={poll.emojis} />
          </Text>
        </View>
      </Pressable>
    ))
  }, [mode, allOptions])

  const pollVoteCounts = useMemo(() => {
    if (poll.voters_count !== null) {
      return (
        <Text style={[styles.votes, { color: theme.secondary }]}>
          {t('shared.poll.meta.count.voters', { count: poll.voters_count })}
        </Text>
      )
    } else if (poll.votes_count !== null) {
      return (
        <Text style={[styles.votes, { color: theme.secondary }]}>
          {t('shared.poll.meta.count.votes', { count: poll.votes_count })}
        </Text>
      )
    }
  }, [poll.voters_count, poll.votes_count])

  return (
    <View style={styles.base}>
      {poll.expired || poll.voted ? pollBodyDisallow : pollBodyAllow}
      <View style={styles.meta}>
        {pollButton}
        {pollVoteCounts}
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
    paddingTop: StyleConstants.Font.LineHeight.M - StyleConstants.Font.Size.M,
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
