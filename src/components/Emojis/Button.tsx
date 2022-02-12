import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { Pressable, StyleSheet } from 'react-native'
import EmojisContext from './helpers/EmojisContext'

const EmojisButton = React.memo(
  () => {
    const { colors } = useTheme()
    const { emojisState, emojisDispatch } = useContext(EmojisContext)

    return emojisState.enabled ? (
      <Pressable
        disabled={!emojisState.emojis || !emojisState.emojis.length}
        onPress={() =>
          emojisDispatch({ type: 'activate', payload: !emojisState.active })
        }
        hitSlop={StyleConstants.Spacing.S}
        style={styles.base}
        children={
          <Icon
            name={
              emojisState.emojis && emojisState.emojis.length
                ? emojisState.active
                  ? 'Type'
                  : 'Smile'
                : 'Meh'
            }
            size={StyleConstants.Font.Size.L}
            color={
              emojisState.emojis && emojisState.emojis.length
                ? colors.primaryDefault
                : colors.disabled
            }
          />
        }
      />
    ) : null
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    paddingLeft: StyleConstants.Spacing.S
  }
})

export default EmojisButton
