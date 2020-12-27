import { StyleConstants } from '@utils/styles/constants'
import React, { createRef, Dispatch, useCallback, useEffect } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import AccountInformationAvatar from './Information/Avatar'
import AccountInformationName from './Information/Name'
import AccountInformationAccount from './Information/Account'
import AccountInformationCreated from './Information/Created'
import AccountInformationStats from './Information/Stats'
import AccountInformationActions from './Information/Actions'
import AccountInformationFields from './Information/Fields'
import AccountInformationNotes from './Information/Notes'
import { AccountAction } from '../Account'

export interface Props {
  accountDispatch?: Dispatch<AccountAction>
  account: Mastodon.Account | undefined
  disableActions?: boolean
}

const AccountInformation: React.FC<Props> = ({
  accountDispatch,
  account,
  disableActions = false
}) => {
  const shimmerAvatarRef = createRef<any>()
  const shimmerNameRef = createRef<any>()
  const shimmerAccountRef = createRef<any>()
  const shimmerCreatedRef = createRef<any>()
  const shimmerStatsRef = createRef<any>()
  useEffect(() => {
    const informationAnimated = Animated.stagger(400, [
      Animated.parallel([
        shimmerAvatarRef.current?.getAnimated(),
        shimmerNameRef.current?.getAnimated(),
        shimmerAccountRef.current?.getAnimated(),
        shimmerCreatedRef.current?.getAnimated(),
        shimmerStatsRef.current?.ref1.getAnimated(),
        shimmerStatsRef.current?.ref2.getAnimated(),
        shimmerStatsRef.current?.ref3.getAnimated()
      ])
    ])
    Animated.loop(informationAnimated).start()
  }, [])

  const onLayout = useCallback(
    ({ nativeEvent }) =>
      accountDispatch &&
      accountDispatch({
        type: 'informationLayout',
        payload: {
          y: nativeEvent.layout.y,
          height: nativeEvent.layout.height
        }
      }),
    []
  )

  return (
    <View style={styles.base} onLayout={onLayout}>
      {/* <Text>Moved or not: {account.moved}</Text> */}
      <View style={styles.avatarAndActions}>
        <AccountInformationAvatar ref={shimmerAvatarRef} account={account} />
        {!disableActions && <AccountInformationActions account={account} />}
      </View>

      <AccountInformationName ref={shimmerNameRef} account={account} />

      <AccountInformationAccount ref={shimmerAccountRef} account={account} />

      {account?.fields && account.fields.length > 0 && (
        <AccountInformationFields account={account} />
      )}

      {account?.note && account.note.length > 0 && account.note !== '<p></p>' && (
        // Empty notes might generate empty p tag
        <AccountInformationNotes account={account} />
      )}

      <AccountInformationCreated ref={shimmerCreatedRef} account={account} />

      <AccountInformationStats ref={shimmerStatsRef} account={account} />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    marginTop: -StyleConstants.Spacing.Global.PagePadding * 3,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  avatarAndActions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
})

export default AccountInformation
