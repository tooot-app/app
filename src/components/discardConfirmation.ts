import i18n from '@i18n/index'
import { Alert } from 'react-native'

export const discardConfirmation = ({
  condition,
  action
}: {
  condition: boolean
  action: () => void
}) => {
  if (condition) {
    Alert.alert(i18n.t('common:discard.title'), i18n.t('common:discard.message'), [
      {
        text: i18n.t('common:buttons.discard'),
        style: 'destructive',
        onPress: () => action()
      },
      {
        text: i18n.t('common:buttons.cancel'),
        style: 'default'
      }
    ])
  } else {
    action()
  }
}
