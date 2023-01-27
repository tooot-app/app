import { HeaderLeft } from '@components/Header'
import { Message } from '@components/Message'
import { useNavigationState } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { TabMePreferencesStackParamList, TabMeStackScreenProps } from '@utils/navigation/navigators'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import FlashMessage from 'react-native-flash-message'
import TabMePreferencesFilter from './Filter'
import TabMePreferencesFilters from './Filters'
import TabMePreferencesRoot from './Root'

const Stack = createNativeStackNavigator<TabMePreferencesStackParamList>()

const TabMePreferences: React.FC<TabMeStackScreenProps<'Tab-Me-Preferences'>> = ({
  navigation
}) => {
  const { t } = useTranslation('screenTabs')
  const messageRef = useRef<FlashMessage>(null)

  const isNested =
    (useNavigationState(
      state => state.routes.find(route => route.name === 'Tab-Me-Preferences')?.state?.routes.length
    ) || 0) > 1

  useEffect(() => {
    navigation.setOptions({ gestureEnabled: !isNested })
  }, [isNested])

  return (
    <>
      <Stack.Navigator screenOptions={{ headerShadowVisible: false }}>
        <Stack.Screen
          name='Tab-Me-Preferences-Root'
          options={{
            title: t('me.stacks.preferences.name'),
            headerLeft: () => (
              <HeaderLeft content='chevron-down' onPress={() => navigation.goBack()} />
            )
          }}
        >
          {props => <TabMePreferencesRoot messageRef={messageRef} {...props} />}
        </Stack.Screen>
        <Stack.Screen
          name='Tab-Me-Preferences-Filters'
          component={TabMePreferencesFilters}
          options={{ title: t('me.stacks.preferencesFilters.name') }}
        />
        <Stack.Screen name='Tab-Me-Preferences-Filter'>
          {props => <TabMePreferencesFilter messageRef={messageRef} {...props} />}
        </Stack.Screen>
      </Stack.Navigator>

      <Message ref={messageRef} />
    </>
  )
}

export default TabMePreferences
