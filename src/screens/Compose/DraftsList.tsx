import { HeaderCenter, HeaderLeft } from '@components/Header'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { StackScreenProps } from '@react-navigation/stack'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
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
    <Stack.Navigator>
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
          headerShadowVisible: false
        }}
      />
    </Stack.Navigator>
  )
}

export default ComposeDraftsList
