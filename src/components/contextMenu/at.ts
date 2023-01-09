import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList, useNavState } from '@utils/navigation/navigators'
import { useTranslation } from 'react-i18next'

const menuAt = ({ account }: { account: Mastodon.Account }): ContextMenu => {
  const { t } = useTranslation('componentContextMenu')
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const navigationState = useNavState()

  return [
    [
      {
        type: 'item',
        key: 'at-direct',
        props: {
          onSelect: () =>
            navigation.navigate('Screen-Compose', {
              type: 'conversation',
              accts: [account.acct],
              visibility: 'direct',
              navigationState
            }),
          disabled: false,
          destructive: false,
          hidden: false
        },
        title: t('at.direct'),
        icon: 'envelope'
      },
      {
        type: 'item',
        key: 'at-public',
        props: {
          onSelect: () =>
            navigation.navigate('Screen-Compose', {
              type: 'conversation',
              accts: [account.acct],
              visibility: 'public',
              navigationState
            }),
          disabled: false,
          destructive: false,
          hidden: false
        },
        title: t('at.public'),
        icon: 'at'
      }
    ]
  ]
}

export default menuAt
