import BottomSheet from '@components/BottomSheet'
import openLink from '@components/openLink'
import { ParseEmojis } from '@components/Parse'
import relativeTime from '@components/relativeTime'
import { Feather } from '@expo/vector-icons'
import { getLocalUrl } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import HeaderDefaultActionsAccount from '@components/Timelines/Timeline/Shared/HeaderDefault/ActionsAccount'
import HeaderDefaultActionsDomain from '@components/Timelines/Timeline/Shared/HeaderDefault/ActionsDomain'
import HeaderDefaultActionsStatus from '@components/Timelines/Timeline/Shared/HeaderDefault/ActionsStatus'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSelector } from 'react-redux'

export interface Props {
  queryKey?: QueryKey.Timeline
  status: Mastodon.Status
  sameAccount: boolean
}

const TimelineHeaderDefault: React.FC<Props> = ({
  queryKey,
  status,
  sameAccount
}) => {
  const domain = status.uri
    ? status.uri.split(new RegExp(/\/\/(.*?)\//))[1]
    : ''
  const name = status.account.display_name || status.account.username
  const emojis = status.account.emojis
  const account = status.account.acct
  const { theme } = useTheme()

  const localDomain = useSelector(getLocalUrl)
  const [since, setSince] = useState(relativeTime(status.created_at))
  const [modalVisible, setBottomSheetVisible] = useState(false)

  // causing full re-render
  useEffect(() => {
    const timer = setTimeout(() => {
      setSince(relativeTime(status.created_at))
    }, 1000)
    return () => {
      clearTimeout(timer)
    }
  }, [since])

  const onPressAction = useCallback(() => setBottomSheetVisible(true), [])
  const onPressApplication = useCallback(
    async () =>
      status.application!.website &&
      (await openLink(status.application!.website)),
    []
  )

  const pressableAction = useMemo(
    () => (
      <Feather
        name='more-horizontal'
        color={theme.secondary}
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    []
  )

  return (
    <View style={styles.base}>
      <View style={queryKey ? { flexBasis: '80%' } : { flexBasis: '100%' }}>
        <View style={styles.nameAndAccount}>
          <Text numberOfLines={1}>
            <ParseEmojis content={name} emojis={emojis} fontBold />
          </Text>
          <Text
            style={[styles.account, { color: theme.secondary }]}
            numberOfLines={1}
          >
            @{account}
          </Text>
        </View>
        <View style={styles.meta}>
          <View>
            <Text style={[styles.created_at, { color: theme.secondary }]}>
              {since}
            </Text>
          </View>
          {status.visibility === 'private' && (
            <Feather
              name='lock'
              size={StyleConstants.Font.Size.S}
              color={theme.secondary}
              style={styles.visibility}
            />
          )}
          {status.application && status.application.name !== 'Web' && (
            <View>
              <Text
                onPress={onPressApplication}
                style={[styles.application, { color: theme.secondary }]}
              >
                发自于 - {status.application.name}
              </Text>
            </View>
          )}
        </View>
      </View>

      {queryKey && (
        <Pressable
          style={styles.action}
          onPress={onPressAction}
          children={pressableAction}
        />
      )}

      {queryKey && (
        <BottomSheet
          visible={modalVisible}
          handleDismiss={() => setBottomSheetVisible(false)}
        >
          {!sameAccount && (
            <HeaderDefaultActionsAccount
              queryKey={queryKey}
              account={status.account}
              setBottomSheetVisible={setBottomSheetVisible}
            />
          )}

          {sameAccount && (
            <HeaderDefaultActionsStatus
              queryKey={queryKey}
              status={status}
              setBottomSheetVisible={setBottomSheetVisible}
            />
          )}

          {domain !== localDomain && (
            <HeaderDefaultActionsDomain
              queryKey={queryKey}
              domain={domain}
              setBottomSheetVisible={setBottomSheetVisible}
            />
          )}
        </BottomSheet>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  nameAndMeta: {
    flexBasis: '80%'
  },
  nameAndAccount: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  account: {
    flex: 1,
    marginLeft: StyleConstants.Spacing.XS
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: StyleConstants.Spacing.XS,
    marginBottom: StyleConstants.Spacing.S
  },
  created_at: {
    ...StyleConstants.FontStyle.S
  },
  visibility: {
    marginLeft: StyleConstants.Spacing.S
  },
  application: {
    ...StyleConstants.FontStyle.S,
    marginLeft: StyleConstants.Spacing.S
  },
  action: {
    flexBasis: '20%',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: StyleConstants.Spacing.S
  }
})

export default React.memo(TimelineHeaderDefault, () => true)
