import { emojis } from '@components/Emojis'
import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { Keyboard, Pressable, View } from 'react-native'
import EmojisContext from './Context'

const EmojisButton: React.FC = () => {
  const { colors } = useTheme()
  const { emojisState, emojisDispatch } = useContext(EmojisContext)

  const focusedPropsIndex = emojisState.inputProps?.findIndex(props => props.isFocused.current)
  if (focusedPropsIndex === -1) {
    return null
  }

  return (
    <Pressable
      disabled={!emojis.current || !emojis.current.length}
      onPress={() => {
        if (emojisState.targetIndex === -1) {
          Keyboard.dismiss()
        }
        emojisDispatch({ type: 'target', payload: focusedPropsIndex })
      }}
      hitSlop={StyleConstants.Spacing.S}
      style={{
        alignSelf: 'flex-end',
        padding: StyleConstants.Spacing.Global.PagePadding / 2
      }}
      children={
        <View
          style={{
            borderWidth: 2,
            borderColor: colors.primaryDefault,
            padding: StyleConstants.Spacing.Global.PagePadding / 2,
            borderRadius: 100
          }}
        >
          <Icon
            name={emojis.current && emojis.current.length ? 'smile' : 'meh'}
            size={24}
            color={
              emojis.current && emojis.current.length ? colors.primaryDefault : colors.disabled
            }
          />
        </View>
      }
    />
  )
}

export default EmojisButton
