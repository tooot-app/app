import { HeaderCenter, HeaderLeft } from '@components/Header'
import { ParseEmojis } from '@components/Parse'
import { StackNavigationState, TypedNavigator } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import TabSharedAccount from '@screens/Tabs/Shared/Account'
import TabSharedAttachments from '@screens/Tabs/Shared/Attachments'
import TabSharedHashtag from '@screens/Tabs/Shared/Hashtag'
import TabSharedSearch from '@screens/Tabs/Shared/Search'
import TabSharedToot from '@screens/Tabs/Shared/Toot'
import TabSharedUsers from '@screens/Tabs/Shared/Users'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { debounce } from 'lodash'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native'
import { NativeStackNavigationOptions } from 'react-native-screens/lib/typescript'
import {
  NativeStackNavigationEventMap,
  NativeStackNavigatorProps
} from 'react-native-screens/lib/typescript/types'

export type BaseScreens =
  | Nav.TabLocalStackParamList
  | Nav.TabPublicStackParamList
  | Nav.TabNotificationsStackParamList
  | Nav.TabMeStackParamList

export type SharedAccountProp = StackScreenProps<
  BaseScreens,
  'Tab-Shared-Account'
>

export type SharedAttachmentsProp = StackScreenProps<
  BaseScreens,
  'Tab-Shared-Attachments'
>

export type SharedHashtagProp = StackScreenProps<
  BaseScreens,
  'Tab-Shared-Hashtag'
>

export type SharedSearchProp = StackScreenProps<
  BaseScreens,
  'Tab-Shared-Search'
>

export type SharedTootProp = StackScreenProps<BaseScreens, 'Tab-Shared-Toot'>

export type SharedUsersProp = StackScreenProps<BaseScreens, 'Tab-Shared-Users'>

const sharedScreens = (
  Stack: TypedNavigator<
    BaseScreens,
    StackNavigationState<Record<string, object | undefined>>,
    NativeStackNavigationOptions,
    NativeStackNavigationEventMap,
    ({ ...rest }: NativeStackNavigatorProps) => JSX.Element
  >
) => {
  const { mode, theme } = useTheme()
  const { t } = useTranslation()

  return [
    <Stack.Screen
      key='Tab-Shared-Account'
      name='Tab-Shared-Account'
      component={TabSharedAccount}
      options={({ navigation }: SharedAccountProp) => {
        return {
          headerTranslucent: true,
          headerStyle: {
            backgroundColor: `rgba(255, 255, 255, 0)`
          },
          headerCenter: () => null,
          headerLeft: () => (
            <HeaderLeft onPress={() => navigation.goBack()} background />
          )
        }
      }}
    />,
    <Stack.Screen
      key='Tab-Shared-Attachments'
      name='Tab-Shared-Attachments'
      component={TabSharedAttachments}
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
              <Trans
                i18nKey='sharedAttachments:heading'
                components={[
                  <ParseEmojis
                    content={account.display_name || account.username}
                    emojis={account.emojis}
                    fontBold
                  />,
                  <Text
                    style={{
                      ...StyleConstants.FontStyle.M,
                      color: theme.primaryDefault,
                      fontWeight: StyleConstants.Font.Weight.Bold
                    }}
                  />
                ]}
              />
            </Text>
          )
        }
      }}
    />,
    <Stack.Screen
      key='Tab-Shared-Hashtag'
      name='Tab-Shared-Hashtag'
      component={TabSharedHashtag}
      options={({ route, navigation }: SharedHashtagProp) => ({
        headerTitle: `#${decodeURIComponent(route.params.hashtag)}`,
        ...(Platform.OS === 'android' && {
          headerCenter: () => (
            <HeaderCenter
              content={`#${decodeURIComponent(route.params.hashtag)}`}
            />
          )
        }),
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    />,
    <Stack.Screen
      key='Tab-Shared-Search'
      name='Tab-Shared-Search'
      component={TabSharedSearch}
      options={({ navigation }: SharedSearchProp) => ({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />,
        headerCenter: () => {
          const onChangeText = debounce(
            (text: string) => navigation.setParams({ text }),
            1000,
            {
              trailing: true
            }
          )
          return (
            <View style={styles.searchBar}>
              <TextInput
                editable={false}
                children={
                  <Text
                    style={[
                      styles.textInput,
                      {
                        color: theme.primaryDefault
                      }
                    ]}
                    children={t('sharedSearch:content.header.prefix')}
                  />
                }
              />
              <TextInput
                keyboardAppearance={mode}
                style={[
                  styles.textInput,
                  {
                    flex: 1,
                    color: theme.primaryDefault,
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
                  navigation.setParams({ text })
                }
                placeholder={t('sharedSearch:content.header.placeholder')}
                placeholderTextColor={theme.secondary}
                returnKeyType='go'
              />
            </View>
          )
        }
      })}
    />,
    <Stack.Screen
      key='Tab-Shared-Toot'
      name='Tab-Shared-Toot'
      component={TabSharedToot}
      options={({ navigation }: SharedTootProp) => ({
        headerTitle: t('sharedToot:heading'),
        ...(Platform.OS === 'android' && {
          headerCenter: () => <HeaderCenter content={t('sharedToot:heading')} />
        }),
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    />,
    <Stack.Screen
      key='Tab-Shared-Users'
      name='Tab-Shared-Users'
      component={TabSharedUsers}
      options={({
        navigation,
        route: {
          params: { reference, type, count }
        }
      }: SharedUsersProp) => ({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />,
        headerTitle: t(`sharedUsers:heading.${reference}.${type}`, { count }),
        ...(Platform.OS === 'android' && {
          headerCenter: () => (
            <HeaderCenter
              content={t(`sharedUsers:heading.${reference}.${type}`, { count })}
            />
          )
        })
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
