import Icon, { IconName } from '@components/Icon'
import CustomText from '@components/Text'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Pressable } from 'react-native'

export type Props = {
  native?: boolean
  background?: boolean

  onPress?: () => void
} & ({ type?: undefined; content?: IconName } | { type: 'text'; content: string })

const HeaderLeft: React.FC<Props> = ({
  type,
  content,
  native = true,
  background = false,
  onPress
}) => {
  const navigation = useNavigation()
  const { colors } = useTheme()

  const children = () => {
    switch (type) {
      case 'text':
        return (
          <CustomText fontStyle='M' style={{ color: colors.primaryDefault }} children={content} />
        )
      default:
        return (
          <Icon
            color={colors.primaryDefault}
            name={content || 'chevron-left'}
            size={StyleConstants.Spacing.M * 1.25}
          />
        )
    }
  }

  return (
    <Pressable
      onPress={onPress ? onPress : () => navigation.goBack()}
      children={children()}
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: background ? colors.backgroundOverlayDefault : undefined,
        minHeight: 44,
        minWidth: 44,
        marginLeft: native ? -StyleConstants.Spacing.S : StyleConstants.Spacing.S,
        ...(type === undefined && {
          borderRadius: 99
        }),
        ...(type === 'text' && {
          paddingHorizontal: StyleConstants.Spacing.S
        })
      }}
    />
  )
}

export default HeaderLeft
