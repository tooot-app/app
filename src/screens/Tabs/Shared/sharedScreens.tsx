import { HeaderCenter, HeaderLeft } from '@components/Header'
import { ParseEmojis } from '@components/Parse'
import { StackNavigationState, TypedNavigator } from '@react-navigation/native'
import { StackScreenProps } from '@react-navigation/stack'
import TabSharedAccount from '@screens/Tabs/Shared/Account'
import TabSharedAttachments from '@screens/Tabs/Shared/Attachments'
import TabSharedHashtag from '@screens/Tabs/Shared/Hashtag'
import TabSharedRelationships from '@screens/Tabs/Shared/Relationships'
import TabSharedSearch from '@screens/Tabs/Shared/Search'
import TabSharedToot from '@screens/Tabs/Shared/Toot'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { debounce } from 'lodash'
import React, { useCallback, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { TextInput } from 'react-native-gesture-handler'
import {
  NativeStackNavigationEventMap,
  NativeStackNavigationOptions,
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

export type SharedRelationshipsProp = StackScreenProps<
  BaseScreens,
  'Tab-Shared-Relationships'
>

export type SharedSearchProp = StackScreenProps<
  BaseScreens,
  'Tab-Shared-Search'
>

export type SharedTootProp = StackScreenProps<BaseScreens, 'Tab-Shared-Toot'>

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
  const { mode, theme } = useTheme()
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
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
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
                      color: theme.primary,
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
      key='Tab-Shared-Relationships'
      name='Tab-Shared-Relationships'
      component={TabSharedRelationships}
      options={({ navigation }: SharedRelationshipsProp) => ({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    />,
    <Stack.Screen
      key='Tab-Shared-Search'
      name='Tab-Shared-Search'
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
              keyboardAppearance={mode}
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
      {() => <TabSharedSearch searchTerm={searchTerm} />}
    </Stack.Screen>,
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
