import React, { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'
import { Feather } from '@expo/vector-icons'

import ParseContent from 'src/components/ParseContent'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTranslation } from 'react-i18next'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformation: React.FC<Props> = ({ account }) => {
  const { t } = useTranslation('sharedAccount')
  const { theme } = useTheme()
  const [avatarLoaded, setAvatarLoaded] = useState(false)

  // add emoji support
  return (
    <View style={styles.information}>
      {/* <Text>Moved or not: {account.moved}</Text> */}
      <ShimmerPlaceholder visible={avatarLoaded} width={90} height={90}>
        <Image
          source={{ uri: account?.avatar }}
          style={styles.avatar}
          onLoadEnd={() => setAvatarLoaded(true)}
        />
      </ShimmerPlaceholder>

      <Text style={[styles.display_name, { color: theme.primary }]}>
        {account?.display_name || account?.username}
        {account?.bot && (
          <Feather name='hard-drive' style={styles.display_name} />
        )}
      </Text>

      <Text style={[styles.account, { color: theme.secondary }]}>
        @{account?.acct}
        {account?.locked && <Feather name='lock' />}
      </Text>

      {account?.fields && (
        <View style={styles.fields}>
          {account.fields.map((field, index) => (
            <View key={index} style={{ flex: 1, flexDirection: 'row' }}>
              <Text
                style={{
                  width: '30%',
                  alignSelf: 'center',
                  color: theme.primary
                }}
              >
                <ParseContent
                  content={field.name}
                  size={StyleConstants.Font.Size.M}
                  emojis={account.emojis}
                  showFullLink
                />{' '}
                {field.verified_at && <Feather name='check-circle' />}
              </Text>
              <Text style={{ width: '70%', color: theme.primary }}>
                <ParseContent
                  content={field.value}
                  size={StyleConstants.Font.Size.M}
                  emojis={account.emojis}
                  showFullLink
                />
              </Text>
            </View>
          ))}
        </View>
      )}

      {account?.note && (
        <View style={styles.note}>
          <ParseContent
            content={account.note}
            size={StyleConstants.Font.Size.M}
            emojis={account.emojis}
          />
        </View>
      )}

      {account?.created_at && (
        <View style={styles.created_at}>
          <Feather name='calendar' size={StyleConstants.Font.Size.M + 2} />
          <Text
            style={{
              color: theme.primary,
              fontSize: StyleConstants.Font.Size.M,
              marginLeft: StyleConstants.Spacing.XS
            }}
          >
            {t('content.created_at', {
              date: new Date(account.created_at).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            })}
          </Text>
        </View>
      )}

      <View style={styles.summary}>
        <Text style={{ color: theme.primary }}>
          {t('content.summary.statuses_count', {
            count: account?.statuses_count
          })}
        </Text>
        <Text style={{ color: theme.primary }}>
          {t('content.summary.followers_count', {
            count: account?.followers_count
          })}
        </Text>
        <Text style={{ color: theme.primary }}>
          {t('content.summary.following_count', {
            count: account?.following_count
          })}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  information: {
    marginTop: -30 - StyleConstants.Spacing.Global.PagePadding,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  avatar: {
    width: StyleConstants.Avatar.L,
    height: StyleConstants.Avatar.L,
    borderRadius: 8
  },
  display_name: {
    fontSize: StyleConstants.Font.Size.L,
    fontWeight: StyleConstants.Font.Weight.Bold,
    marginTop: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.XS
  },
  account: {
    fontSize: StyleConstants.Font.Size.M,
    marginBottom: StyleConstants.Spacing.S
  },
  fields: {
    marginBottom: StyleConstants.Spacing.S
  },
  note: {
    marginBottom: StyleConstants.Spacing.M
  },
  created_at: {
    flexDirection: 'row',
    marginBottom: StyleConstants.Spacing.M
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

export default AccountInformation
