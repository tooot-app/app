import analytics from '@components/analytics'
import { HeaderCenter, HeaderRight } from '@components/Header'
import Timeline from '@components/Timelines/Timeline'
import { useNavigation } from '@react-navigation/native'
import { getLocalActiveIndex } from '@utils/slices/instancesSlice'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import { useSelector } from 'react-redux'
import sharedScreens from './Shared/sharedScreens'

const Stack = createNativeStackNavigator<Nav.LocalStackParamList>()

const ScreenLocal = React.memo(
  () => {
    const { t } = useTranslation('local')
    const navigation = useNavigation()
    const localActiveIndex = useSelector(getLocalActiveIndex)

    const onPressSearch = useCallback(() => {
      analytics('search_tap', { page: 'Local' })
      navigation.navigate('Screen-Local', { screen: 'Screen-Shared-Search' })
    }, [])

    return (
      <Stack.Navigator
        screenOptions={{
          headerLeft: () => null,
          headerRight: () => (
            <HeaderRight content='Search' onPress={onPressSearch} />
          ),
          headerTitle: t('heading'),
          ...(Platform.OS === 'android' && {
            headerCenter: () => <HeaderCenter content={t('heading')} />
          }),
          headerHideShadow: true,
          headerTopInsetEnabled: false
        }}
      >
        <Stack.Screen name='Screen-Local-Root'>
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

export default ScreenLocal
