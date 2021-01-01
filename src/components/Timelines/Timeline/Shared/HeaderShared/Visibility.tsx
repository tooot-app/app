import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet } from 'react-native'

export interface Props {
  visibility?: Mastodon.Status['visibility']
}

const HeaderSharedVisibility: React.FC<Props> = ({ visibility }) => {
  const { theme } = useTheme()

  return visibility && visibility === 'private' ? (
    <Feather
      name='lock'
      size={StyleConstants.Font.Size.S}
      color={theme.secondary}
      style={styles.visibility}
    />
  ) : null
}

const styles = StyleSheet.create({
  visibility: {
    marginLeft: StyleConstants.Spacing.S
  }
})

export default HeaderSharedVisibility
