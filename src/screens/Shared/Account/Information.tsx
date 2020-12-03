import React, { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'
import { Feather } from '@expo/vector-icons'

import ParseContent from 'src/components/ParseContent'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'
import { useTranslation } from 'react-i18next'
import Emojis from 'src/components/Timelines/Timeline/Shared/Emojis'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformation: React.FC<Props> = ({ account }) => {
  const { t } = useTranslation('sharedAccount')
  const { theme } = useTheme()
  const [avatarLoaded, setAvatarLoaded] = useState(false)

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

      <View style={styles.display_name}>
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

      {account?.fields && account.fields.length > 0 && (
        <View style={[styles.fields, { borderTopColor: theme.border }]}>
          {account.fields.map((field, index) => (
            <View
              key={index}
              style={[styles.field, { borderBottomColor: theme.border }]}
            >
              <View
                style={{
                  flexBasis: '30%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRightWidth: 1,
                  borderRightColor: theme.border,
                  paddingLeft: StyleConstants.Spacing.S,
                  paddingRight: StyleConstants.Spacing.S
                }}
              >
                <ParseContent
                  content={field.name}
                  size={StyleConstants.Font.Size.M}
                  emojis={account.emojis}
                  showFullLink
                />
                {field.verified_at && (
                  <Feather
                    name='check-circle'
                    size={StyleConstants.Font.Size.M}
                    color={theme.primary}
                  />
                )}
              </View>
              <View
                style={{
                  flexBasis: '70%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingLeft: StyleConstants.Spacing.S,
                  paddingRight: StyleConstants.Spacing.S
                }}
              >
                <ParseContent
                  content={field.value}
                  size={StyleConstants.Font.Size.M}
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
            size={StyleConstants.Font.Size.M}
            emojis={account.emojis}
          />
        </View>
      )}

      <View style={styles.created_at}>
        <Feather
          name='calendar'
          size={StyleConstants.Font.Size.M + 2}
          color={theme.secondary}
          style={styles.created_at_icon}
        />
        <Text
          style={{
            color: theme.secondary,
            fontSize: StyleConstants.Font.Size.M
          }}
        >
          {t(
            'content.created_at',
            {
              date: new Date(account?.created_at!).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            } || null
          )}
        </Text>
      </View>

      <View style={styles.summary}>
        <Text style={{ color: theme.primary }}>
          {t('content.summary.statuses_count', {
            count: account?.statuses_count || 0
          })}
        </Text>
        <Text style={{ color: theme.primary, textAlign: 'center' }}>
          {t('content.summary.followers_count', {
            count: account?.followers_count || 0
          })}
        </Text>
        <Text style={{ color: theme.primary, textAlign: 'right' }}>
          {t('content.summary.following_count', {
            count: account?.following_count || 0
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
    flexDirection: 'row',
    marginTop: StyleConstants.Spacing.M,
    marginBottom: StyleConstants.Spacing.XS
  },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: StyleConstants.Spacing.L
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
  note: {
    marginBottom: StyleConstants.Spacing.L
  },
  created_at: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: StyleConstants.Spacing.M
  },
  created_at_icon: {
    marginRight: StyleConstants.Spacing.XS
  },
  summary: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

export default AccountInformation
