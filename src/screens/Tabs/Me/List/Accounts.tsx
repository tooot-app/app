import ComponentAccount from '@components/Account'
import Button from '@components/Button'
import haptics from '@components/haptics'
import { displayMessage } from '@components/Message'
import CustomText from '@components/Text'
import { TabMeStackScreenProps } from '@utils/navigation/navigators'
import {
  QueryKeyListAccounts,
  useListAccountsMutation,
  useListAccountsQuery
} from '@utils/queryHooks/lists'
import { flattenPages } from '@utils/queryHooks/utils'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

const TabMeListAccounts: React.FC<TabMeStackScreenProps<'Tab-Me-List-Accounts'>> = ({
  route: { params }
}) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  const queryKey: QueryKeyListAccounts = ['ListAccounts', { id: params.id }]
  const { data, refetch, fetchNextPage, hasNextPage } = useListAccountsQuery({ ...queryKey[1] })

  const mutation = useListAccountsMutation({
    onSuccess: () => {
      haptics('Light')
      refetch()
    },
    onError: () => {
      displayMessage({
        type: 'danger',
        message: t('common:message.error.message', {
          function: t('screenTabs:me.listAccounts.error')
        })
      })
    }
  })

  return (
    <FlatList
      data={flattenPages(data)}
      renderItem={({ item, index }) => (
        <ComponentAccount
          key={index}
          account={item}
          children={
            <Button
              type='icon'
              content='X'
              round
              onPress={() =>
                mutation.mutate({ type: 'delete', payload: { id: params.id, accounts: [item.id] } })
              }
            />
          }
          props={{ disabled: true }}
        />
      )}
      ListEmptyComponent={
        <View
          style={{
            flex: 1,
            minHeight: '100%',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <CustomText
            fontStyle='M'
            style={{
              marginTop: StyleConstants.Spacing.S,
              marginBottom: StyleConstants.Spacing.L,
              color: colors.secondary
            }}
          >
            {t('screenTabs:me.listAccounts.empty')}
          </CustomText>
        </View>
      }
      onEndReached={() => hasNextPage && fetchNextPage()}
    />
  )
}

export default TabMeListAccounts
