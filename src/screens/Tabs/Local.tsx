import analytics from '@components/analytics'
import { HeaderCenter, HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { ScreenTabsParamList } from '@screens/Tabs'
import { getInstanceActive } from '@utils/slices/instancesSlice'
import React, { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useSelector } from 'react-redux'
import sharedScreens from './Shared/sharedScreens'

export type TabLocalProp = BottomTabScreenProps<
  ScreenTabsParamList,
  'Tab-Local'
>

const Stack = createNativeStackNavigator<Nav.TabLocalStackParamList>()

const TabLocal = React.memo(
  ({ navigation }: TabLocalProp) => {
    const { t } = useTranslation('local')
    const instanceActive = useSelector(getInstanceActive)

    const screenOptions = useMemo(
      () => ({
        headerHideShadow: true,
        headerTopInsetEnabled: false
      }),
      []
    )
    const screenOptionsRoot = useMemo(
      () => ({
        headerTitle: t('heading'),
        ...(Platform.OS === 'android' && {
          headerCenter: () => <HeaderCenter content={t('heading')} />
        }),
        headerRight: () => (
          <HeaderRight
            content='Search'
            onPress={() => {
              analytics('search_tap', { page: 'Local' })
              navigation.navigate('Tab-Local', { screen: 'Tab-Shared-Search' })
            }}
          />
        )
      }),
      []
    )
    const children = useCallback(
      () => (instanceActive !== -1 ? <Timeline page='Following' /> : null),
      []
    )

    return (
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen
          name='Tab-Local-Root'
          options={screenOptionsRoot}
          children={children}
        />
        {sharedScreens(Stack as any)}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabLocal
