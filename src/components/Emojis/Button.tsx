import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { Keyboard, Pressable } from 'react-native'
import EmojisContext from './helpers/EmojisContext'

const EmojisButton: React.FC = () => {
  const { colors } = useTheme()
  const { emojisState, emojisDispatch } = useContext(EmojisContext)

  return (
    <Pressable
      disabled={!emojisState.emojis || !emojisState.emojis.length}
      onPress={() => {
        const targetProps = emojisState.inputProps?.find(props => props.ref.current?.isFocused())
        if (!targetProps) {
          return
        }
        if (emojisState.targetProps === null) {
          Keyboard.dismiss()
        }
        emojisDispatch({ type: 'target', payload: targetProps })
      }}
      hitSlop={StyleConstants.Spacing.S}
      style={{ alignSelf: 'flex-end', padding: StyleConstants.Spacing.Global.PagePadding }}
      children={
        <Icon
          name={emojisState.emojis && emojisState.emojis.length ? 'Smile' : 'Meh'}
          size={24}
          color={
            emojisState.emojis && emojisState.emojis.length
              ? colors.primaryDefault
              : colors.disabled
          }
        />
      }
    />
  )
}

export default EmojisButton
