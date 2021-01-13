import BottomSheet from '@components/BottomSheet'
import Icon from '@components/Icon'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getLocalAccount, getLocalUrl } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { useSelector } from 'react-redux'
import HeaderActionsAccount from './ActionsAccount'
import HeaderActionsDomain from './ActionsDomain'
import HeaderActionsStatus from './ActionsStatus'

export interface Props {
  queryKey: QueryKeyTimeline
  status: Mastodon.Status
}

const HeaderActions = React.memo(
  ({ queryKey, status }: Props) => {
    const { theme } = useTheme()

    const localAccount = useSelector(getLocalAccount)
    const sameAccount = localAccount?.id === status.account.id

    const localDomain = useSelector(getLocalUrl)
    const statusDomain = status.uri
      ? status.uri.split(new RegExp(/\/\/(.*?)\//))[1]
      : ''
    const sameDomain = localDomain === statusDomain

    const [modalVisible, setBottomSheetVisible] = useState(false)
    const onPress = useCallback(() => setBottomSheetVisible(true), [])
    const children = useMemo(
      () => (
        <Icon
          name='MoreHorizontal'
          color={theme.secondary}
          size={StyleConstants.Font.Size.L}
        />
      ),
      []
    )

    return (
      <>
        <Pressable style={styles.base} onPress={onPress} children={children} />
        {modalVisible && (
          <BottomSheet
            visible={modalVisible}
            handleDismiss={() => setBottomSheetVisible(false)}
          >
            {!sameAccount && (
              <HeaderActionsAccount
                queryKey={queryKey}
                account={status.account}
                setBottomSheetVisible={setBottomSheetVisible}
              />
            )}

            {sameAccount && (
              <HeaderActionsStatus
                queryKey={queryKey}
                status={status}
                setBottomSheetVisible={setBottomSheetVisible}
              />
            )}

            {!sameDomain && (
              <HeaderActionsDomain
                queryKey={queryKey}
                domain={statusDomain}
                setBottomSheetVisible={setBottomSheetVisible}
              />
            )}
          </BottomSheet>
        )}
      </>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: StyleConstants.Spacing.S
  }
})

export default HeaderActions
