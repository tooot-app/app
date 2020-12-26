import React, { createRef, Dispatch, useEffect, useMemo, useState } from 'react'
import { Animated, Image, StyleSheet, Text, View } from 'react-native'
import { createShimmerPlaceholder } from 'react-native-shimmer-placeholder'
import { Feather } from '@expo/vector-icons'

import ParseContent from '@components/ParseContent'
import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'
import { useTranslation } from 'react-i18next'
import Emojis from '@components/Timelines/Timeline/Shared/Emojis'
import { LinearGradient } from 'expo-linear-gradient'
import { AccountAction } from '../Account'
import Button from '@root/components/Button'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { relationshipFetch } from '@root/utils/fetches/relationshipFetch'
import client from '@root/api/client'
import { useNavigation } from '@react-navigation/native'
import getCurrentTab from '@root/utils/getCurrentTab'

const fireMutation = async ({
  type,
  id,
  stateKey,
  prevState
}: {
  type: 'follow'
  id: string
  stateKey: 'following'
  prevState: boolean
}) => {
  let res
  switch (type) {
    case 'follow':
      res = await client({
        method: 'post',
        instance: 'local',
        url: `accounts/${id}/${prevState ? 'un' : ''}${type}`
      })

      if (res.body[stateKey] === !prevState) {
        return Promise.resolve()
      } else {
        return Promise.reject()
      }
      break
  }
}

export interface Props {
  accountDispatch?: Dispatch<AccountAction>
  account: Mastodon.Account | undefined
  disableActions?: boolean
}

const AccountInformation: React.FC<Props> = ({
  accountDispatch,
  account,
  disableActions = false
}) => {
  const navigation = useNavigation()
  const { t } = useTranslation('sharedAccount')
  const { theme } = useTheme()
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  const relationshipQueryKey = ['Relationship', { id: account?.id }]
  const { status, data, refetch } = useQuery(
    relationshipQueryKey,
    relationshipFetch,
    {
      enabled: false
    }
  )
  useEffect(() => {
    if (account?.id) {
      refetch()
    }
  }, [account])
  const queryClient = useQueryClient()
  const { mutate, status: mutateStatus } = useMutation(fireMutation, {
    onMutate: () => {
      queryClient.cancelQueries(relationshipQueryKey)
      const oldData = queryClient.getQueryData(relationshipQueryKey)

      queryClient.setQueryData(relationshipQueryKey, (old: any) => {
        old && (old.following = !old?.following)
        return old
      })

      return oldData
    },
    onError: (err, _, oldData) => {
      queryClient.setQueryData(relationshipQueryKey, oldData)
    },
    onSettled: () => {
      queryClient.invalidateQueries(['Following'])
    }
  })

  const ShimmerPlaceholder = createShimmerPlaceholder(LinearGradient)
  const shimmerAvatarRef = createRef<any>()
  const shimmerNameRef = createRef<any>()
  const shimmerAccountRef = createRef<any>()
  const shimmerCreatedRef = createRef<any>()
  const shimmerStatTootRef = createRef<any>()
  const shimmerStatFolloingRef = createRef<any>()
  const shimmerStatFollowerRef = createRef<any>()
  useEffect(() => {
    const informationAnimated = Animated.stagger(400, [
      Animated.parallel([
        shimmerAvatarRef.current!.getAnimated(),
        shimmerNameRef.current!.getAnimated(),
        shimmerAccountRef.current!.getAnimated(),
        shimmerCreatedRef.current!.getAnimated(),
        shimmerStatTootRef.current!.getAnimated(),
        shimmerStatFolloingRef.current!.getAnimated(),
        shimmerStatFollowerRef.current!.getAnimated()
      ])
    ])
    Animated.loop(informationAnimated).start()
  }, [])

  const followingButton = useMemo(
    () => (
      <Button
        type='text'
        content={`${data?.following ? '正在' : ''}关注`}
        onPress={() =>
          mutate({
            type: 'follow',
            id: account!.id,
            stateKey: 'following',
            prevState: data!.following
          })
        }
        loading={
          status !== 'success' ||
          (mutateStatus !== 'success' && mutateStatus !== 'idle')
        }
      />
    ),
    [data, status, mutateStatus]
  )

  return (
    <View
      style={styles.base}
      onLayout={({ nativeEvent }) =>
        accountDispatch &&
        accountDispatch({
          type: 'informationLayout',
          payload: {
            y: nativeEvent.layout.y,
            height: nativeEvent.layout.height
          }
        })
      }
    >
      {/* <Text>Moved or not: {account.moved}</Text> */}
      <View style={styles.avatarAndActions}>
        <ShimmerPlaceholder
          ref={shimmerAvatarRef}
          visible={avatarLoaded}
          width={StyleConstants.Avatar.L}
          height={StyleConstants.Avatar.L}
        >
          <Image
            source={{ uri: account?.avatar }}
            style={styles.avatar}
            onLoadEnd={() => setAvatarLoaded(true)}
          />
        </ShimmerPlaceholder>
        {!disableActions && (
          <View style={styles.actions}>
            <Button
              type='icon'
              content='mail'
              round
              onPress={() =>
                navigation.navigate(getCurrentTab(navigation), {
                  screen: 'Screen-Shared-Compose',
                  params: {
                    type: 'conversation',
                    incomingStatus: { account }
                  }
                })
              }
              style={{ marginRight: StyleConstants.Spacing.S }}
            />
            {followingButton}
          </View>
        )}
      </View>

      <ShimmerPlaceholder
        ref={shimmerNameRef}
        visible={account !== undefined}
        width={StyleConstants.Font.Size.L * 8}
        height={StyleConstants.Font.Size.L}
        style={styles.display_name}
      >
        <View>
          {account?.emojis ? (
            <Emojis
              content={account?.display_name || account?.username}
              emojis={account.emojis}
              size={StyleConstants.Font.Size.L}
              fontBold={true}
            />
          ) : (
            <Text
              style={{
                color: theme.primary,
                fontSize: StyleConstants.Font.Size.L,
                fontWeight: StyleConstants.Font.Weight.Bold
              }}
            >
              {account?.display_name || account?.username}
            </Text>
          )}
        </View>
      </ShimmerPlaceholder>

      <ShimmerPlaceholder
        ref={shimmerAccountRef}
        visible={account !== undefined}
        width={StyleConstants.Font.Size.M * 8}
        height={StyleConstants.Font.Size.M}
        style={{ marginBottom: StyleConstants.Spacing.L }}
      >
        <View style={styles.account}>
          <Text
            style={{
              color: theme.secondary,
              fontSize: StyleConstants.Font.Size.M
            }}
            selectable
          >
            @{account?.acct}
          </Text>
          {account?.locked && (
            <Feather
              name='lock'
              style={styles.account_types}
              color={theme.secondary}
            />
          )}
          {account?.bot && (
            <Feather
              name='hard-drive'
              style={styles.account_types}
              color={theme.secondary}
            />
          )}
        </View>
      </ShimmerPlaceholder>

      {account?.fields && account.fields.length > 0 && (
        <View style={[styles.fields, { borderTopColor: theme.border }]}>
          {account.fields.map((field, index) => (
            <View
              key={index}
              style={[styles.field, { borderBottomColor: theme.border }]}
            >
              <View
                style={[styles.fieldLeft, { borderRightColor: theme.border }]}
              >
                <ParseContent
                  content={field.name}
                  size={'M'}
                  emojis={account.emojis}
                  showFullLink
                />
                {field.verified_at && (
                  <Feather
                    name='check-circle'
                    size={StyleConstants.Font.Size.M}
                    color={theme.primary}
                    style={styles.fieldCheck}
                  />
                )}
              </View>
              <View style={styles.fieldRight}>
                <ParseContent
                  content={field.value}
                  size={'M'}
                  emojis={account.emojis}
                  showFullLink
                />
              </View>
            </View>
          ))}
        </View>
      )}

      {account?.note && account.note.length && account.note !== '<p></p>' ? (
        // Empty notes might generate empty p tag
        <View style={styles.note}>
          <ParseContent
            content={account.note}
            size={'M'}
            emojis={account.emojis}
          />
        </View>
      ) : null}

      <ShimmerPlaceholder
        ref={shimmerCreatedRef}
        visible={account !== undefined}
        width={StyleConstants.Font.Size.S * 8}
        height={StyleConstants.Font.Size.S}
        style={{ marginBottom: StyleConstants.Spacing.M }}
      >
        <View style={styles.created_at}>
          <Feather
            name='calendar'
            size={StyleConstants.Font.Size.S}
            color={theme.secondary}
            style={styles.created_at_icon}
          />
          <Text
            style={{
              color: theme.secondary,
              fontSize: StyleConstants.Font.Size.S
            }}
          >
            {t('content.created_at', {
              date: new Date(account?.created_at!).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            })}
          </Text>
        </View>
      </ShimmerPlaceholder>

      <View style={styles.stats}>
        <ShimmerPlaceholder
          ref={shimmerStatTootRef}
          visible={account !== undefined}
          width={StyleConstants.Font.Size.S * 5}
          height={StyleConstants.Font.Size.S}
        >
          <Text style={[styles.stat, { color: theme.primary }]}>
            {t('content.summary.statuses_count', {
              count: account?.statuses_count || 0
            })}
          </Text>
        </ShimmerPlaceholder>
        <ShimmerPlaceholder
          ref={shimmerStatFolloingRef}
          visible={account !== undefined}
          width={StyleConstants.Font.Size.S * 5}
          height={StyleConstants.Font.Size.S}
        >
          <Text
            style={[styles.stat, { color: theme.primary, textAlign: 'center' }]}
          >
            {t('content.summary.followers_count', {
              count: account?.followers_count || 0
            })}
          </Text>
        </ShimmerPlaceholder>
        <ShimmerPlaceholder
          ref={shimmerStatFollowerRef}
          visible={account !== undefined}
          width={StyleConstants.Font.Size.S * 5}
          height={StyleConstants.Font.Size.S}
        >
          <Text
            style={[styles.stat, { color: theme.primary, textAlign: 'right' }]}
          >
            {t('content.summary.following_count', {
              count: account?.following_count || 0
            })}
          </Text>
        </ShimmerPlaceholder>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    marginTop: -StyleConstants.Spacing.Global.PagePadding * 3,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  avatarAndActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  avatar: {
    width: StyleConstants.Avatar.L,
    height: StyleConstants.Avatar.L,
    borderRadius: 8
  },
  actions: {
    alignSelf: 'flex-end',
    flexDirection: 'row'
  },
  display_name: {
    flexDirection: 'row',
    marginTop: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.XS
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  account_types: { marginLeft: StyleConstants.Spacing.S },
  fields: {
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: StyleConstants.Spacing.M
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: StyleConstants.Spacing.S,
    paddingBottom: StyleConstants.Spacing.S
  },
  fieldLeft: {
    flexBasis: '30%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    paddingLeft: StyleConstants.Spacing.S,
    paddingRight: StyleConstants.Spacing.S
  },
  fieldCheck: { marginLeft: StyleConstants.Spacing.XS },
  fieldRight: {
    flexBasis: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: StyleConstants.Spacing.S,
    paddingRight: StyleConstants.Spacing.S
  },
  note: {
    marginBottom: StyleConstants.Spacing.L
  },
  created_at: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  created_at_icon: {
    marginRight: StyleConstants.Spacing.XS
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  stat: {
    fontSize: StyleConstants.Font.Size.S
  }
})

export default AccountInformation
