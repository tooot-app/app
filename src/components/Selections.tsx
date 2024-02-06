import { useTheme } from '@utils/styles/ThemeManager'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { Pressable, View } from 'react-native'
import Icon from './Icon'
import { ParseEmojis } from './Parse'
import CustomText from './Text'
import haptics from './haptics'

export interface Props {
  title?: string

  multiple?: boolean
  options: { selected: boolean; content: string }[]
  setOptions: React.Dispatch<React.SetStateAction<any>>
  disabled?: boolean
  invalid?: boolean
}

const Selections: React.FC<Props> = ({
  title,
  multiple = false,
  options,
  setOptions,
  disabled = false,
  invalid = false
}) => {
  const { colors } = useTheme()

  const isSelected = (index: number) =>
    options[index].selected
      ? multiple
        ? 'check-square'
        : 'check-circle'
      : multiple
      ? 'square'
      : 'circle'

  return (
    <View style={{ marginVertical: StyleConstants.Spacing.S }}>
      {title ? (
        <CustomText
          fontStyle='M'
          children={title}
          style={{ color: disabled ? colors.disabled : colors.primaryDefault }}
        />
      ) : null}
      <View
        style={{
          paddingHorizontal: StyleConstants.Spacing.M,
          paddingVertical: StyleConstants.Spacing.XS,
          marginTop: StyleConstants.Spacing.S,
          borderWidth: 1,
          borderColor: disabled ? colors.disabled : invalid ? colors.red : colors.border
        }}
      >
        {options.map((option, index) => (
          <Pressable
            key={index}
            disabled={disabled}
            style={{ flex: 1, paddingVertical: StyleConstants.Spacing.S }}
            onPress={() => {
              if (multiple) {
                haptics('Light')

                setOptions(
                  options.map((o, i) => (i === index ? { ...o, selected: !o.selected } : o))
                )
              } else {
                if (!option.selected) {
                  haptics('Light')
                  setOptions(
                    options.map((o, i) => {
                      if (i === index) {
                        return { ...o, selected: true }
                      } else {
                        return { ...o, selected: false }
                      }
                    })
                  )
                }
              }
            }}
          >
            <View style={{ flex: 1, flexDirection: 'row' }}>
              <Icon
                style={{
                  marginTop: (StyleConstants.Font.LineHeight.M - StyleConstants.Font.Size.M) / 2,
                  marginRight: StyleConstants.Spacing.S
                }}
                name={isSelected(index)}
                size={StyleConstants.Font.Size.M}
                color={disabled ? colors.disabled : colors.primaryDefault}
              />
              <CustomText fontStyle='S' style={{ flex: 1 }}>
                <ParseEmojis
                  content={option.content}
                  style={{ color: disabled ? colors.disabled : colors.primaryDefault }}
                />
              </CustomText>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  )
}

export default Selections
