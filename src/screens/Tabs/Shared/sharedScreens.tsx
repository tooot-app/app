import { HeaderCenter, HeaderLeft } from '@components/Header'
import { ParseEmojis } from '@components/Parse'
import {
  ParamListBase,
  StackNavigationState,
  TypedNavigator
} from '@react-navigation/native'
import {
  NativeStackNavigationEventMap,
  NativeStackNavigationOptions,
  NativeStackNavigatorProps
} from '@react-navigation/native-stack/lib/typescript/src/types'
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
    Nav.TabLocalStackParamList,
    StackNavigationState<ParamListBase>,
    NativeStackNavigationOptions,
    NativeStackNavigationEventMap,
    ({}: NativeStackNavigatorProps) => JSX.Element
  >
) => {
  const { mode, theme } = useTheme()
  const { t } = useTranslation('screenTabs')

  return (
    <Stack.Group>
      <Stack.Screen
        key='Tab-Shared-Account'
        name='Tab-Shared-Account'
        component={TabSharedAccount}
        options={({ navigation }: SharedAccountProp) => {
          return {
            headerTransparent: true,
            headerStyle: {
              backgroundColor: `rgba(255, 255, 255, 0)`
            },
            headerTitle: '',
            headerLeft: () => (
              <HeaderLeft onPress={() => navigation.goBack()} background />
            )
          }
        }}
      />

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
            headerLeft: () => (
              <HeaderLeft onPress={() => navigation.goBack()} />
            ),
            headerTitle: () => (
              <Text numberOfLines={1}>
                <Trans
                  i18nKey='screenTabs:shared.attachments.name'
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
      />

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
      />

      <Stack.Screen
        key='Tab-Shared-Search'
        name='Tab-Shared-Search'
        component={TabSharedSearch}
        options={({ navigation }: SharedSearchProp) => ({
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />,
          headerTitle: () => {
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
                  style={[
                    styles.textInput,
                    {
                      color: theme.primaryDefault
                    }
                  ]}
                  defaultValue={t('shared.search.header.prefix')}
                />
                <TextInput
                  accessibilityRole='search'
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
                  placeholder={t('shared.search.header.placeholder')}
                  placeholderTextColor={theme.secondary}
                  returnKeyType='go'
                />
              </View>
            )
          }
        })}
      />

      <Stack.Screen
        key='Tab-Shared-Toot'
        name='Tab-Shared-Toot'
        component={TabSharedToot}
        options={({ navigation }: SharedTootProp) => ({
          headerTitle: t('shared.toot.name'),
          ...(Platform.OS === 'android' && {
            headerCenter: () => <HeaderCenter content={t('shared.toot.name')} />
          }),
          headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
        })}
      />

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
          headerTitle: t(`shared.users.${reference}.${type}`, { count }),
          ...(Platform.OS === 'android' && {
            headerCenter: () => (
              <HeaderCenter
                content={t(`shared.users.${reference}.${type}`, { count })}
              />
            )
          })
        })}
      />
    </Stack.Group>
  )
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
