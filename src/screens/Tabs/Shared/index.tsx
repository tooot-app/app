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
import TabSharedFilter from './Filter'

const TabShared = ({ Stack }: { Stack: ReturnType<typeof createNativeStackNavigator> }) => {
  return (
    <Stack.Group>
      <Stack.Screen
        key='Tab-Shared-Account'
        name='Tab-Shared-Account'
        component={TabSharedAccount}
      />
      <Stack.Screen
        key='Tab-Shared-Account-In-Lists'
        name='Tab-Shared-Account-In-Lists'
        component={TabSharedAccountInLists}
      />
      <Stack.Screen
        key='Tab-Shared-Attachments'
        name='Tab-Shared-Attachments'
        component={TabSharedAttachments}
      />
      <Stack.Screen
        key='Tab-Shared-Filter'
        name='Tab-Shared-Filter'
        component={TabSharedFilter}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        key='Tab-Shared-Hashtag'
        name='Tab-Shared-Hashtag'
        component={TabSharedHashtag}
      />
      <Stack.Screen
        key='Tab-Shared-History'
        name='Tab-Shared-History'
        component={TabSharedHistory}
      />
      <Stack.Screen
        key='Tab-Shared-Report'
        name='Tab-Shared-Report'
        component={TabSharedReport}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen key='Tab-Shared-Search' name='Tab-Shared-Search' component={TabSharedSearch} />
      <Stack.Screen key='Tab-Shared-Toot' name='Tab-Shared-Toot' component={TabSharedToot} />
      <Stack.Screen key='Tab-Shared-Users' name='Tab-Shared-Users' component={TabSharedUsers} />
    </Stack.Group>
  )
}

export default TabShared
