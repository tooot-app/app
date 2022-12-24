import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Pressable, View } from 'react-native'
import haptics from './haptics'
import Icon from './Icon'
import { ParseEmojis } from './Parse'
import CustomText from './Text'

export interface Props {
  multiple?: boolean
  options: { selected: boolean; content: string }[]
  setOptions: React.Dispatch<React.SetStateAction<{ selected: boolean; content: string }[]>>
  disabled?: boolean
}

const Selections: React.FC<Props> = ({
  multiple = false,
  options,
  setOptions,
  disabled = false
}) => {
  const { colors } = useTheme()

  const isSelected = (index: number): string =>
    options[index].selected
      ? `Check${multiple ? 'Square' : 'Circle'}`
      : `${multiple ? 'Square' : 'Circle'}`

  return (
    <View>
      {options.map((option, index) => (
        <Pressable
          key={index}
          disabled={disabled}
          style={{ flex: 1, paddingVertical: StyleConstants.Spacing.S }}
          onPress={() => {
            if (multiple) {
              haptics('Light')

              setOptions(options.map((o, i) => (i === index ? { ...o, selected: !o.selected } : o)))
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
                paddingTop: StyleConstants.Font.LineHeight.M - StyleConstants.Font.Size.M,
                marginRight: StyleConstants.Spacing.S
              }}
              name={isSelected(index)}
              size={StyleConstants.Font.Size.M}
              color={disabled ? colors.disabled : colors.primaryDefault}
            />
            <CustomText style={{ flex: 1 }}>
              <ParseEmojis
                content={option.content}
                style={{ color: disabled ? colors.disabled : colors.primaryDefault }}
              />
            </CustomText>
          </View>
        </Pressable>
      ))}
    </View>
  )
}

export default Selections
