import React, { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import ShimmerPlaceholder from 'react-native-shimmer-placeholder'
import { Feather } from '@expo/vector-icons'

import ParseContent from 'src/components/ParseContent'
import { useTheme } from 'src/utils/styles/ThemeManager'

import constants from 'src/utils/styles/constants'

export interface Props {
  account: Mastodon.Account | undefined
}

const AccountInformation: React.FC<Props> = ({ account }) => {
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
                  size={constants.FONT_SIZE_M}
                  emojis={account.emojis}
                  showFullLink
                />{' '}
                {field.verified_at && <Feather name='check-circle' />}
              </Text>
              <Text style={{ width: '70%', color: theme.primary }}>
                <ParseContent
                  content={field.value}
                  size={constants.FONT_SIZE_M}
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
            size={constants.FONT_SIZE_M}
            emojis={account.emojis}
          />
        </View>
      )}

      {account?.created_at && (
        <View style={styles.created_at}>
          <Feather name='calendar' size={constants.FONT_SIZE_M + 2} />
          <Text
            style={{
              color: theme.primary,
              fontSize: constants.FONT_SIZE_M,
              marginLeft: constants.SPACING_XS
            }}
          >
            加入时间：
            {new Date(account.created_at).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Text>
        </View>
      )}

      <View style={styles.summary}>
        <Text style={{ color: theme.primary }}>
          {account?.statuses_count} 条嘟文
        </Text>
        <Text style={{ color: theme.primary }}>
          关注 {account?.followers_count} 人
        </Text>
        <Text style={{ color: theme.primary }}>
          被 {account?.following_count} 人关注
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  information: {
    marginTop: -30 - constants.GLOBAL_PAGE_PADDING,
    padding: constants.GLOBAL_PAGE_PADDING
  },
  avatar: {
    width: constants.AVATAR_L,
    height: constants.AVATAR_L,
    borderRadius: 8
  },
  display_name: {
    fontSize: constants.FONT_SIZE_L,
    fontWeight: 'bold',
    marginTop: constants.SPACING_M,
    marginBottom: constants.SPACING_XS
  },
  account: {
    fontSize: constants.FONT_SIZE_M,
    marginBottom: constants.SPACING_S
  },
  fields: {
    marginBottom: constants.SPACING_S
  },
  note: {
    marginBottom: constants.SPACING_M
  },
  created_at: {
    flexDirection: 'row',
    marginBottom: constants.SPACING_M
  },
  summary: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

export default AccountInformation
