import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet } from 'react-native'

export interface Props {
  muted?: Mastodon.Status['muted']
}

const HeaderSharedMuted: React.FC<Props> = ({ muted }) => {
  const { theme } = useTheme()

  return muted ? (
    <Icon
      name='VolumeX'
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

export default HeaderSharedMuted
