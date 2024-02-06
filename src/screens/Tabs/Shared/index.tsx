import { HeaderLeft, HeaderRight } from '@components/Header'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import TabSharedAccount from '@screens/Tabs/Shared/Account'
import TabSharedAccountInLists from '@screens/Tabs/Shared/AccountInLists'
import TabSharedAttachments from '@screens/Tabs/Shared/Attachments'
import TabSharedHashtag from '@screens/Tabs/Shared/Hashtag'
import TabSharedHistory from '@screens/Tabs/Shared/History'
import TabSharedReport from '@screens/Tabs/Shared/Report'
import TabSharedSearch from '@screens/Tabs/Shared/Search'
import TabSharedToot from '@screens/Tabs/Shared/Toot'
import TabSharedUsers from '@screens/Tabs/Shared/Users'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import TabSharedFilter from './Filter'
import TabSharedMute from './Mute'
import {
  TabLocalStackParamList,
  TabMeStackParamList,
  TabNotificationsStackParamList,
  TabPublicStackParamList
} from '@utils/navigation/navigators'
import CustomText from '@components/Text'
import { ParseEmojis } from '@components/Parse'
import { useTheme } from '@utils/styles/ThemeManager'

const TabShared = (
  Stack: ReturnType<
    typeof createNativeStackNavigator<
      | TabLocalStackParamList
      | TabPublicStackParamList
      | TabNotificationsStackParamList
      | TabMeStackParamList
    >
  >
) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  return (
    <Stack.Group>
      <Stack.Screen
        name='Tab-Shared-Account'
        component={TabSharedAccount}
        options={{
          title: '',
          headerLeft: () => <HeaderLeft background />
        }}
      />
      <Stack.Screen
        name='Tab-Shared-Account-In-Lists'
        component={TabSharedAccountInLists}
        options={({
          navigation,
          route: {
            params: {
              account: { username }
            }
          }
        }) => ({
          presentation: 'modal',
          title: t('screenTabs:shared.accountInLists.name', { username: username }),
          headerRight: () => (
            <HeaderRight
              type='text'
              content={t('common:buttons.done')}
              onPress={() => navigation.pop(1)}
            />
          )
        })}
      />
      <Stack.Screen
        name='Tab-Shared-Attachments'
        component={TabSharedAttachments}
        options={({
          route: {
            params: { account }
          }
        }) => ({
          headerTitle: () => (
            <CustomText numberOfLines={1}>
              <Trans
                ns='screenTabs'
                i18nKey='shared.attachments.name'
                components={[
                  <ParseEmojis
                    content={account.display_name || account.username}
                    emojis={account.emojis}
                    fontBold
                  />,
                  <CustomText
                    fontStyle='M'
                    style={{ color: colors.primaryDefault }}
                    fontWeight='Bold'
                  />
                ]}
              />
            </CustomText>
          )
        })}
      />
      <Stack.Screen
        name='Tab-Shared-Filter'
        component={TabSharedFilter}
        options={({ navigation }) => ({
          presentation: 'modal',
          title: t('screenTabs:shared.filter.name'),
          headerRight: () => (
            <HeaderRight
              type='text'
              content={t('common:buttons.done')}
              onPress={() => navigation.goBack()}
            />
          )
        })}
      />
      <Stack.Screen
        name='Tab-Shared-Hashtag'
        component={TabSharedHashtag}
        options={({
          route: {
            params: { tag_name }
          }
        }) => ({ title: `#${decodeURIComponent(tag_name)}` })}
      />
      <Stack.Screen
        name='Tab-Shared-History'
        component={TabSharedHistory}
        options={{ title: t('screenTabs:shared.history.name') }}
      />
      <Stack.Screen
        name='Tab-Shared-Mute'
        component={TabSharedMute}
        options={({
          route: {
            params: {
              account: { acct }
            }
          }
        }) => ({
          presentation: 'modal',
          headerLeft: () => <HeaderLeft type='text' content={t('common:buttons.cancel')} />,
          title: t('screenTabs:shared.mute.name', { acct: `@${acct}` })
        })}
      />
      <Stack.Screen
        name='Tab-Shared-Report'
        component={TabSharedReport}
        options={({
          route: {
            params: { account }
          }
        }) => ({
          presentation: 'modal',
          headerLeft: () => <HeaderLeft type='text' content={t('common:buttons.cancel')} />,
          title: t('screenTabs:shared.report.name', { acct: `@${account.acct}` })
        })}
      />
      <Stack.Screen key='Tab-Shared-Search' name='Tab-Shared-Search' component={TabSharedSearch} />
      <Stack.Screen
        name='Tab-Shared-Toot'
        component={TabSharedToot}
        options={{ title: t('screenTabs:shared.toot.name') }}
      />
      <Stack.Screen
        name='Tab-Shared-Users'
        component={TabSharedUsers}
        options={({ route: { params } }) => ({
          title: t(`shared.users.${params.reference}.${params.type}`, {
            count: params.count
          } as any) as any
        })}
      />
    </Stack.Group>
  )
}

export default TabShared
