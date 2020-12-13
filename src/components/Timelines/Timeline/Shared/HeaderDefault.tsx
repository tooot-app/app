import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'

import Emojis from './Emojis'
import relativeTime from 'src/utils/relativeTime'
import { getLocalAccountId, getLocalUrl } from 'src/utils/slices/instancesSlice'
import { useTheme } from 'src/utils/styles/ThemeManager'
import BottomSheet from 'src/components/BottomSheet'
import { useSelector } from 'react-redux'
import { StyleConstants } from 'src/utils/styles/constants'
import HeaderDefaultActionsAccount from './HeaderDefault/ActionsAccount'
import HeaderDefaultActionsStatus from './HeaderDefault/ActionsStatus'
import HeaderDefaultActionsDomain from './HeaderDefault/ActionsDomain'

export interface Props {
  queryKey?: App.QueryKey
  status: Mastodon.Status
}

const TimelineHeaderDefault: React.FC<Props> = ({ queryKey, status }) => {
  const domain = status.uri
    ? status.uri.split(new RegExp(/\/\/(.*?)\//))[1]
    : ''
  const name = status.account.display_name || status.account.username
  const emojis = status.account.emojis
  const account = status.account.acct
  const { theme } = useTheme()

  const navigation = useNavigation()
  const localAccountId = useSelector(getLocalAccountId)
  const localDomain = useSelector(getLocalUrl)
  const [since, setSince] = useState(relativeTime(status.created_at))
  const [modalVisible, setBottomSheetVisible] = useState(false)

  // causing full re-render
  useEffect(() => {
    setTimeout(() => {
      setSince(relativeTime(status.created_at))
    }, 1000)
  }, [since])

  const onPressAction = useCallback(() => setBottomSheetVisible(true), [])
  const onPressApplication = useCallback(() => {
    navigation.navigate('Screen-Shared-Webview', {
      uri: status.application!.website
    })
  }, [])

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
      <View style={styles.nameAndMeta}>
        <View style={styles.name}>
          {emojis?.length ? (
            <Emojis
              content={name}
              emojis={emojis}
              size={StyleConstants.Font.Size.M}
              fontBold={true}
            />
          ) : (
            <Text
              numberOfLines={1}
              style={[styles.nameWithoutEmoji, { color: theme.primary }]}
            >
              {name}
            </Text>
          )}
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
          {status.account.id !== localAccountId && (
            <HeaderDefaultActionsAccount
              queryKey={queryKey}
              accountId={status.account.id}
              account={status.account.acct}
              setBottomSheetVisible={setBottomSheetVisible}
            />
          )}

          {status.account.id === localAccountId && (
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
    flexDirection: 'row'
  },
  nameAndMeta: {
    flexBasis: '80%'
  },
  name: {
    flexDirection: 'row'
  },
  nameWithoutEmoji: {
    fontSize: StyleConstants.Font.Size.M,
    fontWeight: StyleConstants.Font.Weight.Bold
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
    fontSize: StyleConstants.Font.Size.S
  },
  visibility: {
    marginLeft: StyleConstants.Spacing.S
  },
  application: {
    fontSize: StyleConstants.Font.Size.S,
    marginLeft: StyleConstants.Spacing.S
  },
  action: {
    flexBasis: '20%',
    flexDirection: 'row',
    justifyContent: 'center'
  }
})

export default React.memo(TimelineHeaderDefault, () => true)
