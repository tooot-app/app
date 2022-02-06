import { HeaderLeft } from '@components/Header'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { ScreenComposeStackScreenProps } from '@utils/navigation/navigators'
import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import ComposeDraftsListRoot from './DraftsList/Root'

const Stack = createNativeStackNavigator()

const ComposeDraftsList: React.FC<
  ScreenComposeStackScreenProps<'Screen-Compose-DraftsList'>
> = ({
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
          title: t('content.draftsList.header.title'),
          headerShadowVisible: false
        }}
      />
    </Stack.Navigator>
  )
}

export default ComposeDraftsList
