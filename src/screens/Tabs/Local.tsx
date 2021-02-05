import analytics from '@components/analytics'
import { HeaderCenter, HeaderRight } from '@components/Header'
import Timeline from '@components/Timelines/Timeline'
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { ScreenTabsParamList } from '@screens/Tabs'
import { getLocalActiveIndex } from '@utils/slices/instancesSlice'
import React, { useCallback } from 'react'
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
    const localActiveIndex = useSelector(getLocalActiveIndex)

    const onPressSearch = useCallback(() => {
      analytics('search_tap', { page: 'Local' })
      navigation.navigate('Tab-Local', { screen: 'Tab-Shared-Search' })
    }, [])

    return (
      <Stack.Navigator
        screenOptions={{
          headerLeft: () => null,
          headerTitle: t('heading'),
          ...(Platform.OS === 'android' && {
            headerCenter: () => <HeaderCenter content={t('heading')} />
          }),
          headerHideShadow: true,
          headerTopInsetEnabled: false
        }}
      >
        <Stack.Screen
          name='Tab-Local-Root'
          options={{
            headerRight: () => (
              <HeaderRight content='Search' onPress={onPressSearch} />
            )
          }}
        >
          {() =>
            localActiveIndex !== null ? <Timeline page='Following' /> : null
          }
        </Stack.Screen>

        {sharedScreens(Stack as any)}
      </Stack.Navigator>
    )
  },
  () => true
)

export default TabLocal
