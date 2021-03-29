import { HeaderCenter, HeaderLeft } from '@components/Header'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { createNativeStackNavigator } from 'react-native-screens/native-stack'
import ComposeDraftsListRoot from './DraftsList/Root'

const Stack = createNativeStackNavigator()

export type ScreenComposeEditAttachmentProp = StackScreenProps<
  Nav.ScreenComposeStackParamList,
  'Screen-Compose-DraftsList'
>

const ComposeDraftsList: React.FC<ScreenComposeEditAttachmentProp> = ({
  route: {
    params: { timestamp }
  },
  navigation
}) => {
  const { t } = useTranslation('screenCompose')

  const children = useCallback(
    () => <ComposeDraftsListRoot timestamp={timestamp} />,
    []
  )
  const headerLeft = useCallback(
    () => (
      <HeaderLeft
        type='icon'
        content='ChevronDown'
        onPress={() => navigation.goBack()}
      />
    ),
    []
  )

  return (
    <Stack.Navigator screenOptions={{ headerTopInsetEnabled: false }}>
      <Stack.Screen
        name='Screen-Compose-EditAttachment-Root'
        children={children}
        options={{
          headerLeft,
          headerTitle: t('content.draftsList.header.title'),
          ...(Platform.OS === 'android' && {
            headerCenter: () => (
              <HeaderCenter content={t('content.draftsList.header.title')} />
            )
          }),
          headerHideShadow: true
        }}
      />
    </Stack.Navigator>
  )
}

export default ComposeDraftsList
