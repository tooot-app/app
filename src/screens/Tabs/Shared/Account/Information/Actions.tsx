import Button from '@components/Button'
import menuAt from '@components/contextMenu/at'
import { RelationshipOutgoing } from '@components/Relationship'
import { useNavigation } from '@react-navigation/native'
import { useAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import * as DropdownMenu from 'zeego/dropdown-menu'
import AccountContext from '../Context'

const AccountInformationActions: React.FC = () => {
  const { account, relationship, pageMe } = useContext(AccountContext)

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

  if (pageMe) {
    return (
      <View style={styles.base}>
        <Button
          type='text'
          disabled={account === undefined}
          content={t('me.stacks.profile.name')}
          onPress={() => navigation.navigate('Tab-Me-Profile')}
        />
        <Button
          round
          type='icon'
          disabled={account === undefined}
          content='sliders'
          style={{ marginLeft: StyleConstants.Spacing.S }}
          onPress={() => navigation.navigate('Tab-Me-Preferences')}
        />
      </View>
    )
  }

  const [accountId] = useAccountStorage.string('auth.account.id')
  const ownAccount = account?.id === accountId

  const mAt = menuAt({ account })

  if (!ownAccount && account) {
    return (
      <View style={styles.base}>
        {relationship && !relationship.blocked_by ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button
                round
                type='icon'
                content='at-sign'
                style={{ flex: 1, marginRight: StyleConstants.Spacing.S }}
                onPress={() => {}}
              />
            </DropdownMenu.Trigger>

            <DropdownMenu.Content>
              {mAt.map((group, index) => (
                <DropdownMenu.Group key={index}>
                  {group.map(item => {
                    switch (item.type) {
                      case 'item':
                        return (
                          <DropdownMenu.Item key={item.key} {...item.props}>
                            <DropdownMenu.ItemTitle children={item.title} />
                            {item.icon ? <DropdownMenu.ItemIcon ios={{ name: item.icon }} /> : null}
                          </DropdownMenu.Item>
                        )
                      case 'sub':
                        return (
                          // @ts-ignore
                          <DropdownMenu.Sub key={item.key}>
                            <DropdownMenu.SubTrigger key={item.trigger.key} {...item.trigger.props}>
                              <DropdownMenu.ItemTitle children={item.trigger.title} />
                              {item.trigger.icon ? (
                                <DropdownMenu.ItemIcon ios={{ name: item.trigger.icon }} />
                              ) : null}
                            </DropdownMenu.SubTrigger>
                            <DropdownMenu.SubContent>
                              {item.items.map(sub => (
                                <DropdownMenu.Item key={sub.key} {...sub.props}>
                                  <DropdownMenu.ItemTitle children={sub.title} />
                                  {sub.icon ? (
                                    <DropdownMenu.ItemIcon ios={{ name: sub.icon }} />
                                  ) : null}
                                </DropdownMenu.Item>
                              ))}
                            </DropdownMenu.SubContent>
                          </DropdownMenu.Sub>
                        )
                    }
                  })}
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
    alignItems: 'stretch'
  }
})

export default AccountInformationActions
