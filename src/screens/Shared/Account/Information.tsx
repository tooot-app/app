import React, { createRef, Dispatch, useEffect, useState } from 'react'
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

export interface Props {
  accountDispatch?: Dispatch<AccountAction>
  account: Mastodon.Account | undefined
}

const AccountInformation: React.FC<Props> = ({ accountDispatch, account }) => {
  const { t } = useTranslation('sharedAccount')
  const { theme } = useTheme()
  const [avatarLoaded, setAvatarLoaded] = useState(false)

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

  return (
    <View
      style={styles.information}
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

      {account?.note && (
        <View style={styles.note}>
          <ParseContent
            content={account.note}
            size={'M'}
            emojis={account.emojis}
          />
        </View>
      )}

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
  information: {
    marginTop: -StyleConstants.Spacing.Global.PagePadding * 3,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  avatar: {
    width: StyleConstants.Avatar.L,
    height: StyleConstants.Avatar.L,
    borderRadius: 8
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
