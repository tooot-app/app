import { HeaderCenter, HeaderLeft } from '@components/Header'
import { ParseEmojis } from '@components/Parse'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabSharedAccount from '@screens/Tabs/Shared/Account'
import TabSharedAttachments from '@screens/Tabs/Shared/Attachments'
import TabSharedHashtag from '@screens/Tabs/Shared/Hashtag'
import TabSharedSearch from '@screens/Tabs/Shared/Search'
import TabSharedToot from '@screens/Tabs/Shared/Toot'
import TabSharedUsers from '@screens/Tabs/Shared/Users'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { debounce } from 'lodash'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native'

const TabSharedRoot = ({
  Stack
}: {
  Stack: ReturnType<typeof createNativeStackNavigator>
}) => {
  const { colors, mode } = useTheme()
  const { t } = useTranslation('screenTabs')

  return (
    <Stack.Group
      screenOptions={({ navigation }) => ({
        headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
      })}
    >
      <Stack.Screen
        key='Tab-Shared-Account'
        name='Tab-Shared-Account'
        component={TabSharedAccount}
        options={({
          navigation
        }: TabSharedStackScreenProps<'Tab-Shared-Account'>) => {
          return {
            headerTransparent: true,
            headerStyle: {
              backgroundColor: `rgba(255, 255, 255, 0)`
            },
            title: '',
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
          }
        }: TabSharedStackScreenProps<'Tab-Shared-Attachments'>) => {
          return {
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
                        color: colors.primaryDefault,
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
        options={({
          route
        }: TabSharedStackScreenProps<'Tab-Shared-Hashtag'>) => ({
          title: `#${decodeURIComponent(route.params.hashtag)}`
        })}
      />

      <Stack.Screen
        key='Tab-Shared-Search'
        name='Tab-Shared-Search'
        component={TabSharedSearch}
        options={({
          navigation
        }: TabSharedStackScreenProps<'Tab-Shared-Search'>) => ({
          ...(Platform.OS === 'ios'
            ? {
                headerLeft: () => (
                  <HeaderLeft onPress={() => navigation.goBack()} />
                )
              }
            : { headerLeft: () => null }),
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
                      color: colors.primaryDefault
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
                      color: colors.primaryDefault,
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
                  placeholderTextColor={colors.secondary}
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
        options={{
          title: t('shared.toot.name')
        }}
      />

      <Stack.Screen
        key='Tab-Shared-Users'
        name='Tab-Shared-Users'
        component={TabSharedUsers}
        options={({
          route: {
            params: { reference, type, count }
          }
        }: TabSharedStackScreenProps<'Tab-Shared-Users'>) => ({
          title: t(`shared.users.${reference}.${type}`, { count }),
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

export default TabSharedRoot
