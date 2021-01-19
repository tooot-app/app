import { HeaderCenter, HeaderLeft } from '@components/Header'
import { ParseEmojis } from '@components/Parse'
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
import { Platform, StyleSheet, Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import { NativeStackNavigationOptions } from 'react-native-screens/lib/typescript'
import {
  NativeStackNavigationEventMap,
  NativeStackNavigatorProps
} from 'react-native-screens/lib/typescript/types'
import ScreenSharedAttachments from './Attachments'

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

export type SharedAttachmentsProp = StackScreenProps<
  BaseScreens,
  'Screen-Shared-Attachments'
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

export type SharedSearchProp = StackScreenProps<
  BaseScreens,
  'Screen-Shared-Search'
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
        stackAnimation: 'fade',
        headerShown: false
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Attachments'
      name='Screen-Shared-Attachments'
      component={ScreenSharedAttachments}
      options={({
        route: {
          params: { account }
        },
        navigation
      }: SharedAttachmentsProp) => {
        return {
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />,
          headerCenter: () => (
            <Text numberOfLines={1}>
              <ParseEmojis
                content={account.display_name || account.username}
                emojis={account.emojis}
                fontBold
              />
              <Text
                style={{
                  ...StyleConstants.FontStyle.M,
                  color: theme.primary,
                  fontWeight: StyleConstants.Font.Weight.Bold
                }}
              >
                {' '}
                的媒体
              </Text>
            </Text>
          )
        }
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Compose'
      name='Screen-Shared-Compose'
      component={Compose}
      options={{
        stackPresentation: 'fullScreenModal',
        headerShown: false
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Hashtag'
      name='Screen-Shared-Hashtag'
      component={ScreenSharedHashtag}
      options={({ route, navigation }: SharedHashtagProp) => ({
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
        stackAnimation: 'none',
        headerShown: false
      }}
    />,
    <Stack.Screen
      key='Screen-Shared-Relationships'
      name='Screen-Shared-Relationships'
      component={ScreenSharedRelationships}
      options={({ navigation }: SharedRelationshipsProp) => ({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    />,
    <Stack.Screen
      key='Screen-Shared-Search'
      name='Screen-Shared-Search'
      options={({ navigation }: SharedSearchProp) => ({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />,
        // https://github.com/react-navigation/react-navigation/issues/6746#issuecomment-583897436
        headerCenter: () => (
          <View style={styles.searchBar}>
            <TextInput
              editable={false}
              children={
                <Text
                  style={[
                    styles.textInput,
                    {
                      color: theme.primary
                    }
                  ]}
                  children={t('sharedSearch:content.header.prefix')}
                />
              }
            />
            <TextInput
              style={[
                styles.textInput,
                {
                  flex: 1,
                  color: theme.primary,
                  paddingLeft: StyleConstants.Spacing.XS
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
              placeholder={t('sharedSearch:content.header.placeholder')}
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
      options={({ navigation }: SharedTootProp) => ({
        headerTitle: t('sharedToot:heading'),
        ...(Platform.OS === 'android' && {
          headerCenter: () => <HeaderCenter content={t('sharedToot:heading')} />
        }),
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
    fontSize: StyleConstants.Font.Size.M
  }
})

export default sharedScreens
