import analytics from '@components/analytics'
import BottomSheet from '@components/BottomSheet'
import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timelines/Timeline'
import HeaderActionsAccount from '@components/Timelines/Timeline/Shared/HeaderActions/Account'
import HeaderActionsShare from '@components/Timelines/Timeline/Shared/HeaderActions/Share'
import { useAccountQuery } from '@utils/queryHooks/account'
import { getLocalAccount } from '@utils/slices/instancesSlice'
import { useTheme } from '@utils/styles/ThemeManager'
import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState
} from 'react'
import { StyleSheet, View } from 'react-native'
import { useSharedValue } from 'react-native-reanimated'
import { useSelector } from 'react-redux'
import AccountAttachments from './Account/Attachments'
import AccountHeader from './Account/Header'
import AccountInformation from './Account/Information'
import AccountNav from './Account/Nav'
import AccountContext from './Account/utils/createContext'
import accountInitialState from './Account/utils/initialState'
import accountReducer from './Account/utils/reducer'
import { SharedAccountProp } from './sharedScreens'

const ScreenSharedAccount: React.FC<SharedAccountProp> = ({
  route: {
    params: { account }
  },
  navigation
}) => {
  const { theme } = useTheme()

  const localAccount = useSelector(getLocalAccount)
  const { data } = useAccountQuery({ id: account.id })

  const scrollY = useSharedValue(0)
  const [accountState, accountDispatch] = useReducer(
    accountReducer,
    accountInitialState
  )

  const [modalVisible, setBottomSheetVisible] = useState(false)
  useEffect(() => {
    const updateHeaderRight = () =>
      navigation.setOptions({
        headerRight: () => (
          <HeaderRight
            content='MoreHorizontal'
            onPress={() => {
              analytics('bottomsheet_open_press', {
                page: 'account'
              })
              setBottomSheetVisible(true)
            }}
          />
        )
      })
    return updateHeaderRight()
  }, [])

  const onScroll = useCallback(({ nativeEvent }) => {
    scrollY.value = nativeEvent.contentOffset.y
  }, [])

  const ListHeaderComponent = useMemo(() => {
    return (
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <AccountHeader account={data} />
        <AccountInformation account={data} />
        <AccountAttachments account={data} />
      </View>
    )
  }, [data])

  return (
    <AccountContext.Provider value={{ accountState, accountDispatch }}>
      <AccountNav scrollY={scrollY} account={data} />

      <Timeline
        page='Account_Default'
        account={account.id}
        disableRefresh
        customProps={{
          onScroll,
          scrollEventThrottle: 16,
          ListHeaderComponent
        }}
      />

      <BottomSheet
        visible={modalVisible}
        handleDismiss={() => setBottomSheetVisible(false)}
      >
        {/* 添加到列表 */}
        {localAccount?.id !== account.id && (
          <HeaderActionsAccount
            account={account}
            setBottomSheetVisible={setBottomSheetVisible}
          />
        )}

        <HeaderActionsShare
          url={account.url}
          type='account'
          setBottomSheetVisible={setBottomSheetVisible}
        />
      </BottomSheet>
    </AccountContext.Provider>
  )
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1
  }
})

export default ScreenSharedAccount
