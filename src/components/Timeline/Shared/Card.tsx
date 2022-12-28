import ComponentAccount from '@components/Account'
import GracefullyImage from '@components/GracefullyImage'
import openLink from '@components/openLink'
import CustomText from '@components/Text'
import { useNavigation } from '@react-navigation/native'
import { matchAccount, matchStatus } from '@utils/helpers/urlMatcher'
import { useAccountQuery } from '@utils/queryHooks/account'
import { useSearchQuery } from '@utils/queryHooks/search'
import { useStatusQuery } from '@utils/queryHooks/status'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useEffect, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import TimelineDefault from '../Default'
import StatusContext from './Context'

const TimelineCard: React.FC = () => {
  const { status, spoilerHidden, disableDetails } = useContext(StatusContext)
  if (!status || !status.card) return null

  const { colors } = useTheme()
  const navigation = useNavigation()

  const [loading, setLoading] = useState(false)
  const isStatus = matchStatus(status.card.url)
  const [foundStatus, setFoundStatus] = useState<Mastodon.Status>()
  const isAccount = matchAccount(status.card.url)
  const [foundAccount, setFoundAccount] = useState<Mastodon.Account>()

  const searchQuery = useSearchQuery({
    type: (() => {
      if (isStatus) return 'statuses'
      if (isAccount) return 'accounts'
    })(),
    term: (() => {
      if (isStatus) {
        if (isStatus.sameInstance) {
          return
        } else {
          return status.card.url
        }
      }
      if (isAccount) {
        if (isAccount.sameInstance) {
          if (isAccount.style === 'default') {
            return
          } else {
            return isAccount.username
          }
        } else {
          return status.card.url
        }
      }
    })(),
    limit: 1,
    options: { enabled: false }
  })

  const statusQuery = useStatusQuery({
    id: isStatus?.id || '',
    options: { enabled: false }
  })
  useEffect(() => {
    if (isStatus) {
      setLoading(true)
      if (isStatus.sameInstance) {
        statusQuery
          .refetch()
          .then(res => {
            res.data && setFoundStatus(res.data)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      } else {
        searchQuery
          .refetch()
          .then(res => {
            const status = (res.data as any)?.statuses?.[0]
            status && setFoundStatus(status)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      }
    }
  }, [])

  const accountQuery = useAccountQuery({
    id: isAccount?.style === 'default' ? isAccount.id : '',
    options: { enabled: false }
  })
  useEffect(() => {
    if (isAccount) {
      setLoading(true)
      if (isAccount.sameInstance && isAccount.style === 'default') {
        accountQuery
          .refetch()
          .then(res => {
            res.data && setFoundAccount(res.data)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      } else {
        searchQuery
          .refetch()
          .then(res => {
            const account = (res.data as any)?.accounts?.[0]
            account && setFoundAccount(account)
            setLoading(false)
          })
          .catch(() => setLoading(false))
      }
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
    if (isStatus && foundStatus) {
      return <TimelineDefault item={foundStatus} disableDetails disableOnPress />
    }
    if (isAccount && foundAccount) {
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
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: StyleConstants.Spacing.S,
        overflow: 'hidden',
        borderColor: colors.border
      }}
      onPress={async () => status.card && (await openLink(status.card.url, navigation))}
      children={cardContent()}
    />
  )
}

export default TimelineCard
