import Button from '@components/Button'
import menuAt from '@components/contextMenu/at'
import { RelationshipOutgoing } from '@components/Relationship'
import { useNavigation } from '@react-navigation/native'
import { useRelationshipQuery } from '@utils/queryHooks/relationship'
import { useAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo?: boolean
}

const AccountInformationActions: React.FC<Props> = ({ account, myInfo }) => {
  if (!account || account.suspended) {
    return null
  }

  const { t } = useTranslation('screenTabs')
  const navigation = useNavigation<any>()

  if (account?.moved) {
    const accountMoved = account.moved
    return (
      <View style={styles.base}>
        <Button
          type='text'
          content={t('shared.account.moved')}
          onPress={() => navigation.push('Tab-Shared-Account', { account: accountMoved })}
        />
      </View>
    )
  }

  if (myInfo) {
    return (
      <View style={styles.base}>
        <Button
          type='text'
          disabled={account === undefined}
          content={t('me.stacks.profile.name')}
          onPress={() => navigation.navigate('Tab-Me-Profile')}
        />
      </View>
    )
  }

  const [accountId] = useAccountStorage.string('auth.account.id')
  const ownAccount = account?.id === accountId

  const query = useRelationshipQuery({ id: account.id })
  const mAt = menuAt({ account })

  if (!ownAccount && account) {
    return (
      <View style={styles.base}>
        {query.data && !query.data.blocked_by ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button
                round
                type='icon'
                content='AtSign'
                style={{ marginRight: StyleConstants.Spacing.S }}
                onPress={() => {}}
              />
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              {mAt.map((mGroup, index) => (
                <DropdownMenu.Group key={index}>
                  {mGroup.map(menu => (
                    <DropdownMenu.Item key={menu.key} {...menu.item}>
                      <DropdownMenu.ItemTitle children={menu.title} />
                      <DropdownMenu.ItemIcon iosIconName={menu.icon} />
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Group>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ) : null}
        <RelationshipOutgoing id={account.id} />
      </View>
    )
  } else {
    return null
  }
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-end',
    flexDirection: 'row',
    alignItems: 'center'
  }
})

export default AccountInformationActions
