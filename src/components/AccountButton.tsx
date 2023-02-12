import { useNavigation } from '@react-navigation/native'
import { ReadableAccountType, setAccount } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Pressable } from 'react-native'
import GracefullyImage from './GracefullyImage'
import haptics from './haptics'
import Icon from './Icon'
import CustomText from './Text'

interface Props {
  account: ReadableAccountType
  additionalActions?: () => void
}

const AccountButton: React.FC<Props> = ({ account, additionalActions }) => {
  const { colors } = useTheme()
  const navigation = useNavigation()

  return (
    <Pressable
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: StyleConstants.Spacing.S,
        paddingHorizontal: StyleConstants.Spacing.S * 1.5,
        borderColor: account.active ? colors.blue : colors.border,
        borderWidth: 1,
        borderRadius: 99,
        marginBottom: StyleConstants.Spacing.S
      }}
      onPress={async () => {
        await setAccount(account.key)
        haptics('Light')
        navigation.goBack()
        if (additionalActions) {
          additionalActions()
        }
      }}
    >
      <GracefullyImage
        sources={{ default: { uri: account.avatar_static } }}
        dimension={{
          width: StyleConstants.Font.Size.L,
          height: StyleConstants.Font.Size.L
        }}
        style={{ borderRadius: 99, overflow: 'hidden' }}
      />
      <CustomText
        fontStyle='M'
        fontWeight={account.active ? 'Bold' : 'Normal'}
        style={{
          color: account.active ? colors.blue : colors.primaryDefault,
          marginLeft: StyleConstants.Spacing.S
        }}
        children={account.acct}
      />
      {account.active ? (
        <Icon
          name='check'
          size={StyleConstants.Font.Size.L}
          color={colors.blue}
          style={{ marginLeft: StyleConstants.Spacing.S }}
        />
      ) : null}
    </Pressable>
  )
}

export default AccountButton
