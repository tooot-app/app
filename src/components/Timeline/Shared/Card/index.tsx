import ComponentAccount from '@components/Account'
import GracefullyImage from '@components/GracefullyImage'
import CustomText from '@components/Text'
import openLink from '@components/openLink'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { isDevelopment } from '@utils/helpers/checkEnvironment'
import { urlMatcher } from '@utils/helpers/urlMatcher'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { useAccountQuery } from '@utils/queryHooks/account'
import { useStatusQuery } from '@utils/queryHooks/status'
import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'
import React, { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, View } from 'react-native'
import TimelineDefault from '../../Default'
import StatusContext from '../Context'
import { CardNeodb } from './Neodb'

const CARD_URL_BLACKLISTS = ['weibo.com', 'weibo.cn']

const TimelineCard: React.FC = () => {
  const { status, spoilerHidden, disableDetails, inThread } = useContext(StatusContext)
  if (!status || !status.card) return null

  if (CARD_URL_BLACKLISTS.find(domain => status.card?.url.includes(`${domain}/`))) return null

  const { i18n } = useTranslation()
  if (
    (status.card.url.includes('://neodb.social/') &&
      i18n.language.toLowerCase().startsWith('zh-hans')) ||
    isDevelopment
  ) {
    return <CardNeodb />
  }

  const { colors } = useTheme()
  const navigation = useNavigation<StackNavigationProp<TabLocalStackParamList>>()

  const [loading, setLoading] = useState(false)
  const match = urlMatcher(status.card.url)
  const [foundStatus, setFoundStatus] = useState<Mastodon.Status>()
  const [foundAccount, setFoundAccount] = useState<Mastodon.Account>()

  const statusQuery = useStatusQuery({
    status: match?.status ? { ...match.status, uri: status.card.url } : undefined,
    options: { enabled: false, retry: false }
  })
  useEffect(() => {
    if (match?.status) {
      setLoading(true)
      statusQuery
        .refetch()
        .then(res => {
          res.data && setFoundStatus(res.data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [])

  const accountQuery = useAccountQuery({
    account: match?.account ? { ...match?.account, url: status.card.url } : undefined,
    options: { enabled: false, retry: false }
  })
  useEffect(() => {
    if (match?.account) {
      setLoading(true)
      accountQuery
        .refetch()
        .then(res => {
          res.data && setFoundAccount(res.data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [])

  if (loading) {
    return null
  }
  if (status.media_attachments.length) {
    return null
  }
  if ((!status.card?.image || !status.card.title) && !status.card?.description) {
    return null
  }

  const cardContent = () => {
    if (match?.status && foundStatus) {
      return <TimelineDefault item={foundStatus} disableDetails disableOnPress />
    }
    if (match?.account && foundAccount) {
      return <ComponentAccount account={foundAccount} />
    }
    return (
      <>
        {status.card?.image ? (
          <GracefullyImage
            sources={{ default: { uri: status.card.image }, blurhash: status.card.blurhash }}
            style={{ flexBasis: StyleConstants.Font.LineHeight.M * 5 }}
            imageStyle={{ borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }}
            dim
            withoutTransition={inThread}
          />
        ) : null}
        <View style={{ flex: 1, padding: StyleConstants.Spacing.S }}>
          {status.card?.title.length ? (
            <CustomText
              fontStyle='S'
              numberOfLines={2}
              style={{
                marginBottom: StyleConstants.Spacing.XS,
                color: colors.primaryDefault
              }}
              fontWeight='Bold'
              testID='title'
            >
              {status.card.title}
            </CustomText>
          ) : null}
          {status.card?.description.length ? (
            <CustomText
              fontStyle='S'
              numberOfLines={1}
              style={{
                marginBottom: StyleConstants.Spacing.XS,
                color: colors.primaryDefault
              }}
              testID='description'
            >
              {status.card.description}
            </CustomText>
          ) : null}
          {status.card?.url.length ? (
            <CustomText fontStyle='S' numberOfLines={1} style={{ color: colors.secondary }}>
              {status.card.url}
            </CustomText>
          ) : null}
        </View>
      </>
    )
  }

  if (spoilerHidden || disableDetails) return null

  return (
    <Pressable
      accessible
      accessibilityRole='link'
      style={{
        flex: 1,
        flexDirection: 'row',
        marginTop: StyleConstants.Spacing.M,
        borderWidth: 1,
        borderRadius: StyleConstants.BorderRadius,
        overflow: 'hidden',
        borderColor: colors.border
      }}
      onPress={async () => {
        if (match?.status && foundStatus) {
          navigation.push('Tab-Shared-Toot', { toot: foundStatus })
          return
        }
        if (match?.account && foundAccount) {
          navigation.push('Tab-Shared-Account', { account: foundAccount })
          return
        }

        status.card?.url && (await openLink(status.card.url, navigation))
      }}
      children={cardContent()}
    />
  )
}

export default TimelineCard
