import Button from '@components/Button'
import haptics from '@components/haptics'
import { HeaderRight } from '@components/Header'
import { MenuRow } from '@components/Menu'
import CustomText from '@components/Text'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useAccountInListsQuery } from '@utils/queryHooks/account'
import { useListAccountsMutation, useListsQuery } from '@utils/queryHooks/lists'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { SectionList, View } from 'react-native'

const TabSharedAccountInLists: React.FC<
  TabSharedStackScreenProps<'Tab-Shared-Account-In-Lists'>
> = ({
  navigation,
  route: {
    params: { account }
  }
}) => {
  const { colors } = useTheme()
  const { t } = useTranslation('screenTabs')

  useEffect(() => {
    navigation.setOptions({
      presentation: 'modal',
      title: t('shared.accountInLists.name', { username: account.username }),
      headerRight: () => {
        return (
          <HeaderRight
            type='text'
            content={t('common:buttons.done')}
            onPress={() => navigation.pop(1)}
          />
        )
      }
    })
  }, [])

  const listsQuery = useListsQuery({})
  const accountInListsQuery = useAccountInListsQuery({ id: account.id })

  const sections = [
    { id: 'in', title: t('shared.accountInLists.inLists'), data: accountInListsQuery.data || [] },
    {
      id: 'out',
      title: t('shared.accountInLists.notInLists'),
      data:
        listsQuery.data?.filter(
          ({ id }) => accountInListsQuery.data?.filter(d => d.id !== id).length
        ) || []
    }
  ]

  const listAccountsMutation = useListAccountsMutation({})

  return (
    <SectionList
      style={{ padding: StyleConstants.Spacing.Global.PagePadding }}
      sections={sections}
      SectionSeparatorComponent={props => {
        return props.leadingItem && props.trailingSection ? (
          <View style={{ flex: 1, height: StyleConstants.Spacing.Global.PagePadding * 2 }} />
        ) : null
      }}
      renderSectionHeader={({ section: { title, data } }) =>
        data.length ? (
          <CustomText fontStyle='S' style={{ color: colors.secondary }} children={title} />
        ) : null
      }
      renderItem={({ index, item, section }) => (
        <MenuRow
          key={index}
          iconFront='List'
          content={
            <Button
              type='icon'
              content={section.id === 'in' ? 'Minus' : 'Plus'}
              round
              disabled={accountInListsQuery.isFetching}
              onPress={() => {
                switch (section.id) {
                  case 'in':
                    listAccountsMutation
                      .mutateAsync({
                        type: 'delete',
                        payload: { id: item.id, accounts: [account.id] }
                      })
                      .then(() => {
                        haptics('Light')
                        accountInListsQuery.refetch()
                      })
                    break
                  case 'out':
                    listAccountsMutation
                      .mutateAsync({
                        type: 'add',
                        payload: { id: item.id, accounts: [account.id] }
                      })
                      .then(() => {
                        haptics('Light')
                        accountInListsQuery.refetch()
                      })
                    break
                }
              }}
            />
          }
          title={item.title}
        />
      )}
    ></SectionList>
  )
}

export default TabSharedAccountInLists
