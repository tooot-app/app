import Button from '@components/Button'
import haptics from '@components/haptics'
import Icon from '@components/Icon'
import { displayMessage } from '@components/Message'
import { ParseEmojis } from '@components/Parse'
import RelativeTime from '@components/RelativeTime'
import CustomText from '@components/Text'
import {
  MutationVarsTimelineUpdateStatusProperty,
  useTimelineMutation
} from '@utils/queryHooks/timeline'
import updateStatusProperty from '@utils/queryHooks/timeline/updateStatusProperty'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { maxBy } from 'lodash'
import React, { useCallback, useContext, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import { useQueryClient } from 'react-query'
import StatusContext from './Context'

const TimelinePoll: React.FC = () => {
  const { queryKey, rootQueryKey, status, isReblog, ownAccount, spoilerHidden, disableDetails } =
    useContext(StatusContext)
  if (!queryKey || !status || !status.poll) return null
  const poll = status.poll

  const { colors, theme } = useTheme()
  const { t, i18n } = useTranslation('componentTimeline')

  const [allOptions, setAllOptions] = useState(new Array(status.poll.options.length).fill(false))

  const queryClient = useQueryClient()
  const mutation = useTimelineMutation({
    onSuccess: ({ body }, params) => {
      const theParams = params as MutationVarsTimelineUpdateStatusProperty
      queryClient.cancelQueries(queryKey)
      rootQueryKey && queryClient.cancelQueries(rootQueryKey)

      haptics('Success')
      switch (theParams.payload.property) {
        case 'poll':
          theParams.payload.data = body as unknown as Mastodon.Poll
          updateStatusProperty(theParams)
          break
      }
    },
    onError: (err: any, params) => {
      const theParams = params as MutationVarsTimelineUpdateStatusProperty
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          // @ts-ignore
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
      if (!ownAccount && !poll.voted) {
        return (
          <View style={{ marginRight: StyleConstants.Spacing.S }}>
            <Button
              onPress={() =>
                mutation.mutate({
                  type: 'updateStatusProperty',
                  queryKey,
                  rootQueryKey,
                  id: status.id,
                  isReblog,
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
          <View style={{ marginRight: StyleConstants.Spacing.S }}>
            <Button
              onPress={() =>
                mutation.mutate({
                  type: 'updateStatusProperty',
                  queryKey,
                  rootQueryKey,
                  id: status.id,
                  isReblog,
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
  }, [theme, i18n.language, poll.expired, poll.voted, allOptions, mutation.isLoading])

  const isSelected = useCallback(
    (index: number): string =>
      allOptions[index]
        ? `Check${poll.multiple ? 'Square' : 'Circle'}`
        : `${poll.multiple ? 'Square' : 'Circle'}`,
    [allOptions]
  )

  const pollBodyDisallow = useMemo(() => {
    const maxValue = maxBy(poll.options, option => option.votes_count)?.votes_count
    return poll.options.map((option, index) => (
      <View key={index} style={{ flex: 1, paddingVertical: StyleConstants.Spacing.S }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Icon
            style={{
              paddingTop: StyleConstants.Font.LineHeight.M - StyleConstants.Font.Size.M,
              marginRight: StyleConstants.Spacing.S
            }}
            name={
              `${poll.own_votes?.includes(index) ? 'Check' : ''}${
                poll.multiple ? 'Square' : 'Circle'
              }` as any
            }
            size={StyleConstants.Font.Size.M}
            color={poll.own_votes?.includes(index) ? colors.blue : colors.disabled}
          />
          <CustomText style={{ flex: 1 }}>
            <ParseEmojis content={option.title} emojis={poll.emojis} />
          </CustomText>
          <CustomText
            fontStyle='M'
            style={{
              alignSelf: 'center',
              marginLeft: StyleConstants.Spacing.S,
              flexBasis: '20%',
              textAlign: 'center',
              color: colors.primaryDefault
            }}
          >
            {poll.votes_count
              ? Math.round((option.votes_count / (poll.voters_count || poll.votes_count)) * 100)
              : 0}
            %
          </CustomText>
        </View>

        <View
          style={{
            height: StyleConstants.Spacing.XS,
            minWidth: 2,
            borderTopRightRadius: 10,
            borderBottomRightRadius: 10,
            marginTop: StyleConstants.Spacing.XS,
            marginBottom: StyleConstants.Spacing.S,
            width: `${Math.round(
              (option.votes_count / (poll.voters_count || poll.votes_count)) * 100
            )}%`,
            backgroundColor: option.votes_count === maxValue ? colors.blue : colors.disabled
          }}
        />
      </View>
    ))
  }, [theme, poll.options])
  const pollBodyAllow = useMemo(() => {
    return poll.options.map((option, index) => (
      <Pressable
        key={index}
        style={{ flex: 1, paddingVertical: StyleConstants.Spacing.S }}
        onPress={() => {
          !allOptions[index] && haptics('Light')
          if (poll.multiple) {
            setAllOptions(allOptions.map((o, i) => (i === index ? !o : o)))
          } else {
            {
              const otherOptions = allOptions[index] === false ? false : undefined
              setAllOptions(
                allOptions.map((o, i) =>
                  i === index ? !o : otherOptions !== undefined ? otherOptions : o
                )
              )
            }
          }
        }}
      >
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Icon
            style={{
              paddingTop: StyleConstants.Font.LineHeight.M - StyleConstants.Font.Size.M,
              marginRight: StyleConstants.Spacing.S
            }}
            name={isSelected(index)}
            size={StyleConstants.Font.Size.M}
            color={colors.primaryDefault}
          />
          <CustomText style={{ flex: 1 }}>
            <ParseEmojis content={option.title} emojis={poll.emojis} />
          </CustomText>
        </View>
      </Pressable>
    ))
  }, [theme, allOptions])

  const pollVoteCounts = () => {
    if (poll.voters_count !== null) {
      return t('shared.poll.meta.count.voters', { count: poll.voters_count }) + ' • '
    } else if (poll.votes_count !== null) {
      return t('shared.poll.meta.count.votes', { count: poll.votes_count }) + ' • '
    }
  }

  const pollExpiration = () => {
    if (poll.expired) {
      return t('shared.poll.meta.expiration.expired')
    } else {
      if (poll.expires_at) {
        return (
          <Trans
            i18nKey='componentTimeline:shared.poll.meta.expiration.until'
            components={[<RelativeTime time={poll.expires_at} />]}
          />
        )
      }
    }
  }

  if (spoilerHidden || disableDetails) return null

  return (
    <View style={{ marginTop: StyleConstants.Spacing.M }}>
      {poll.expired || poll.voted ? pollBodyDisallow : pollBodyAllow}
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: StyleConstants.Spacing.XS
        }}
      >
        {pollButton}
        <CustomText fontStyle='S' style={{ flexShrink: 1, color: colors.secondary }}>
          {pollVoteCounts()}
          {pollExpiration()}
        </CustomText>
      </View>
    </View>
  )
}

export default TimelinePoll
