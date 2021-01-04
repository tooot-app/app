import BottomSheet from '@components/BottomSheet'
import Icon from '@components/Icon'
import { getLocalUrl } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import HeaderDefaultActionsAccount from '@components/Timelines/Timeline/Shared/HeaderDefault/ActionsAccount'
import HeaderDefaultActionsDomain from '@components/Timelines/Timeline/Shared/HeaderDefault/ActionsDomain'
import HeaderDefaultActionsStatus from '@components/Timelines/Timeline/Shared/HeaderDefault/ActionsStatus'
import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useSelector } from 'react-redux'
import HeaderSharedAccount from './HeaderShared/Account'
import HeaderSharedApplication from './HeaderShared/Application'
import HeaderSharedCreated from './HeaderShared/Created'
import HeaderSharedVisibility from './HeaderShared/Visibility'

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
  const { theme } = useTheme()

  const localDomain = useSelector(getLocalUrl)
  const [modalVisible, setBottomSheetVisible] = useState(false)

  const onPressAction = useCallback(() => setBottomSheetVisible(true), [])

  const pressableAction = useMemo(
    () => (
      <Icon
        name='MoreHorizontal'
        color={theme.secondary}
        size={StyleConstants.Font.Size.M + 2}
      />
    ),
    []
  )

  return (
    <View style={styles.base}>
      <View style={styles.accountAndMeta}>
        <HeaderSharedAccount account={status.account} />
        <View style={styles.meta}>
          <HeaderSharedCreated created_at={status.created_at} />
          <HeaderSharedVisibility visibility={status.visibility} />
          <HeaderSharedApplication application={status.application} />
        </View>
      </View>

      {queryKey && (
        <Pressable
          style={styles.action}
          onPress={onPressAction}
          children={pressableAction}
        />
      )}

      {queryKey && modalVisible && (
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
    flexDirection: 'row'
  },
  accountAndMeta: {
    flex: 4
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
  action: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: StyleConstants.Spacing.S
  }
})

export default React.memo(TimelineHeaderDefault, () => true)
