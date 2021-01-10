import { HeaderLeft } from '@components/Header'
import { StackNavigationState, TypedNavigator } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import ScreenSharedAccount from '@screens/Shared/Account'
import ScreenSharedAnnouncements from '@screens/Shared/Announcements'
import Compose from '@screens/Shared/Compose'
import ScreenSharedHashtag from '@screens/Shared/Hashtag'
import ScreenSharedImagesViewer from '@screens/Shared/ImagesViewer'
import ScreenSharedRelationships from '@screens/Shared/Relationships'
import ScreenSharedSearch from '@screens/Shared/Search'
import ScreenSharedToot from '@screens/Shared/Toot'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { debounce } from 'lodash'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { NativeStackNavigationOptions } from 'react-native-screens/lib/typescript'
import {
  NativeStackNavigationEventMap,
  NativeStackNavigatorProps
} from 'react-native-screens/lib/typescript/types'

export type BaseScreens =
  | Nav.LocalStackParamList
  | Nav.RemoteStackParamList
  | Nav.NotificationsStackParamList
  | Nav.MeStackParamList

export type SharedAccountProp = StackScreenProps<
  BaseScreens,
  'Screen-Shared-Account'
>

export type SharedAnnouncementsProp = StackScreenProps<
  BaseScreens,
  'Screen-Shared-Announcements'
>

export type SharedComposeProp = StackScreenProps<
  BaseScreens,
  'Screen-Shared-Compose'
>

export type SharedHashtagProp = StackScreenProps<
  BaseScreens,
  'Screen-Shared-Hashtag'
>

export type SharedImagesViewerProp = StackScreenProps<
  BaseScreens,
  'Screen-Shared-ImagesViewer'
>

export type SharedRelationshipsProp = StackScreenProps<
  BaseScreens,
  'Screen-Shared-Relationships'
>

export type SharedTootProp = StackScreenProps<BaseScreens, 'Screen-Shared-Toot'>

const sharedScreens = (
  Stack: TypedNavigator<
    BaseScreens,
    StackNavigationState<Record<string, object | undefined>>,
    NativeStackNavigationOptions,
    NativeStackNavigationEventMap,
    ({
      initialRouteName,
      children,
      screenOptions,
      ...rest
    }: NativeStackNavigatorProps) => JSX.Element
  >
) => {
  const { theme } = useTheme()
  const { t } = useTranslation()

  const [searchTerm, setSearchTerm] = useState<string>()
  const onChangeText = useCallback(
    debounce(text => setSearchTerm(text), 1000, {
      trailing: true
    }),
    []
  )

  return [
    <Stack.Screen
      key='Screen-Shared-Account'
      name='Screen-Shared-Account'
      component={ScreenSharedAccount}
      options={({ navigation }: SharedAccountProp) => {
        return {
          headerTranslucent: true,
          headerStyle: {
            backgroundColor: `rgba(255, 255, 255, 0)`
          },
          headerCenter: () => null,
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
        }
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Announcements'
      name='Screen-Shared-Announcements'
      component={ScreenSharedAnnouncements}
      options={{
        stackPresentation: 'transparentModal',
        stackAnimation: 'fade'
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Compose'
      name='Screen-Shared-Compose'
      component={Compose}
      options={{
        stackPresentation: 'fullScreenModal'
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Hashtag'
      name='Screen-Shared-Hashtag'
      component={ScreenSharedHashtag}
      options={({ route, navigation }: any) => ({
        title: `#${decodeURIComponent(route.params.hashtag)}`,
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    />,
    <Stack.Screen
      key='Screen-Shared-ImagesViewer'
      name='Screen-Shared-ImagesViewer'
      component={ScreenSharedImagesViewer}
      options={{
        stackPresentation: 'transparentModal',
        stackAnimation: 'none'
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Relationships'
      name='Screen-Shared-Relationships'
      component={ScreenSharedRelationships}
      options={({ route, navigation }: any) => ({
        title: route.params.account.display_name || route.params.account.name,
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    />,
    <Stack.Screen
      key='Screen-Shared-Search'
      name='Screen-Shared-Search'
      options={({ navigation }: any) => ({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />,
        // https://github.com/react-navigation/react-navigation/issues/6746#issuecomment-583897436
        headerCenter: () => (
          <View style={styles.searchBar}>
            <Text
              style={{ ...StyleConstants.FontStyle.M, color: theme.primary }}
            >
              搜索
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.primary
                }
              ]}
              autoFocus
              onChangeText={onChangeText}
              autoCapitalize='none'
              autoCorrect={false}
              clearButtonMode='never'
              keyboardType='web-search'
              onSubmitEditing={({ nativeEvent: { text } }) =>
                setSearchTerm(text)
              }
              placeholder={'些什么'}
              placeholderTextColor={theme.secondary}
              returnKeyType='go'
            />
          </View>
        )
      })}
    >
      {() => <ScreenSharedSearch searchTerm={searchTerm} />}
    </Stack.Screen>,
    <Stack.Screen
      key='Screen-Shared-Toot'
      name='Screen-Shared-Toot'
      component={ScreenSharedToot}
      options={({ navigation }: any) => ({
        title: t('sharedToot:heading'),
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    />
  ]
}

const styles = StyleSheet.create({
  searchBar: {
    flexBasis: '80%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  textInput: {
    ...StyleConstants.FontStyle.M,
    paddingLeft: StyleConstants.Spacing.XS,
    marginBottom:
      (StyleConstants.Font.LineHeight.M - StyleConstants.Font.Size.M) / 2
  }
})

export default sharedScreens
