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
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { FlatList, View } from 'react-native'

const TabMeListAccounts: React.FC<TabMeStackScreenProps<'Tab-Me-List-Accounts'>> = ({
  route: { params }
}) => {
  const { colors, theme } = useTheme()
  const { t } = useTranslation('screenTabs')

  const queryKey: QueryKeyListAccounts = ['ListAccounts', { id: params.id }]
  const { data, refetch, fetchNextPage, hasNextPage } = useListAccountsQuery({
    ...queryKey[1],
    options: {
      getNextPageParam: lastPage =>
        lastPage?.links?.next && {
          max_id: lastPage.links.next
        }
    }
  })

  const flattenData = data?.pages ? data.pages?.flatMap(page => [...page.body]) : []

  const mutation = useListAccountsMutation({
    onSuccess: () => {
      haptics('Light')
      refetch()
    },
    onError: () => {
      displayMessage({
        theme,
        type: 'error',
        message: t('common:message.error.message', {
          function: t('me.listAccounts.error')
        })
      })
    }
  })

  return (
    <FlatList
      data={flattenData}
      renderItem={({ item, index }) => (
        <ComponentAccount
          key={index}
          account={item}
          Component={View}
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
            {t('me.listAccounts.empty')}
          </CustomText>
        </View>
      }
      onEndReached={() => hasNextPage && fetchNextPage()}
    />
  )
}

export default TabMeListAccounts
