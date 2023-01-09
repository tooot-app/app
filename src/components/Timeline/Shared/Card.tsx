import ComponentAccount from '@components/Account'
import GracefullyImage from '@components/GracefullyImage'
import openLink from '@components/openLink'
import CustomText from '@components/Text'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { urlMatcher } from '@utils/helpers/urlMatcher'
import { TabLocalStackParamList } from '@utils/navigation/navigators'
import { useAccountQuery } from '@utils/queryHooks/account'
import { useStatusQuery } from '@utils/queryHooks/status'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useEffect, useState } from 'react'
import { Pressable, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import TimelineDefault from '../Default'
import StatusContext from './Context'

const TimelineCard: React.FC = () => {
  const { status, spoilerHidden, disableDetails } = useContext(StatusContext)
  if (!status || !status.card) return null

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

  const cardContent = () => {
    if (loading) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingVertical: StyleConstants.Spacing.M
          }}
        >
          <Circle size={StyleConstants.Font.Size.L} color={colors.secondary} />
        </View>
      )
    }
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
            uri={{ original: status.card.image }}
            blurhash={status.card.blurhash}
            style={{ flexBasis: StyleConstants.Font.LineHeight.M * 5 }}
            imageStyle={{ borderTopLeftRadius: 6, borderBottomLeftRadius: 6 }}
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
        borderRadius: StyleConstants.Spacing.S,
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
