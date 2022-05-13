import Icon from '@components/Icon'
import CustomText from '@components/Text'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useMemo } from 'react'
import { Pressable } from 'react-native'

export interface Props {
  type?: 'icon' | 'text'
  content?: string
  native?: boolean
  background?: boolean

  onPress: () => void
}

const HeaderLeft: React.FC<Props> = ({
  type = 'icon',
  content,
  native = true,
  background = false,
  onPress
}) => {
  const { colors, theme } = useTheme()

  const children = useMemo(() => {
    switch (type) {
      case 'icon':
        return (
          <Icon
            color={colors.primaryDefault}
            name={content || 'ChevronLeft'}
            size={StyleConstants.Spacing.M * 1.25}
          />
        )
      case 'text':
        return (
          <CustomText
            fontStyle='M'
            style={{ color: colors.primaryDefault }}
            children={content}
          />
        )
    }
  }, [theme])

  return (
    <Pressable
      onPress={onPress}
      children={children}
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: background
          ? colors.backgroundOverlayDefault
          : undefined,
        minHeight: 44,
        minWidth: 44,
        marginLeft: native
          ? -StyleConstants.Spacing.S
          : StyleConstants.Spacing.S,
        ...(type === 'icon' && {
          borderRadius: 100
        }),
        ...(type === 'text' && {
          paddingHorizontal: StyleConstants.Spacing.S
        })
      }}
    />
  )
}

export default HeaderLeft
