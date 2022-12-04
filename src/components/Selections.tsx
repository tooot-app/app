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
}

const Selections: React.FC<Props> = ({ multiple = false, options, setOptions }) => {
  const { colors } = useTheme()

  const isSelected = (index: number): string =>
    options[index].selected
      ? `Check${multiple ? 'Square' : 'Circle'}`
      : `${multiple ? 'Square' : 'Circle'}`

  return (
    <>
      {options.map((option, index) => (
        <Pressable
          key={index}
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
              color={colors.primaryDefault}
            />
            <CustomText style={{ flex: 1 }}>
              <ParseEmojis content={option.content} />
            </CustomText>
          </View>
        </Pressable>
      ))}
    </>
  )
}

export default Selections
