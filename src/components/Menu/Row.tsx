import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from 'src/utils/styles/ThemeManager'

import { ColorDefinitions } from 'src/utils/styles/themes'
import { StyleConstants } from 'src/utils/styles/constants'

export interface Props {
  iconFront?: any
  iconFrontColor?: ColorDefinitions
  title: string
  content?: string
  iconBack?: 'chevron-right' | 'check'
  iconBackColor?: ColorDefinitions
  onPress?: () => void
}

const Core: React.FC<Props> = ({
  iconFront,
  iconFrontColor,
  title,
  content,
  iconBack,
  iconBackColor
}) => {
  const { theme } = useTheme()
  iconFrontColor = iconFrontColor || 'primary'
  iconBackColor = iconBackColor || 'secondary'

  return (
    <View style={styles.core}>
      <View style={styles.front}>
        {iconFront && (
          <Feather
            name={iconFront}
            size={StyleConstants.Font.Size.M + 2}
            color={theme[iconFrontColor]}
            style={styles.iconFront}
          />
        )}
        <Text style={[styles.text, { color: theme.primary }]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      {(content || iconBack) && (
        <View style={styles.back}>
          {content && (
            <Text
              style={[styles.content, { color: theme.secondary }]}
              numberOfLines={1}
            >
              {content}
            </Text>
          )}
          {iconBack && (
            <Feather
              name={iconBack}
              size={StyleConstants.Font.Size.M + 2}
              color={theme[iconBackColor]}
              style={styles.iconBack}
            />
          )}
        </View>
      )}
    </View>
  )
}

const MenuRow: React.FC<Props> = ({ ...props }) => {
  const { theme } = useTheme()

  return props.onPress ? (
    <Pressable
      style={[styles.base, { borderBottomColor: theme.separator }]}
      onPress={props.onPress}
    >
      <Core {...props} />
    </Pressable>
  ) : (
    <View style={[styles.base, { borderBottomColor: theme.separator }]}>
      <Core {...props} />
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderBottomWidth: 1
  },
  core: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding
  },
  front: {
    flex: 1,
    flexBasis: '70%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  back: {
    flex: 1,
    flexBasis: '30%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  iconFront: {
    marginRight: 8
  },
  text: {
    flex: 1,
    fontSize: StyleConstants.Font.Size.M
  },
  content: {
    fontSize: StyleConstants.Font.Size.M
  },
  iconBack: {
    marginLeft: 8
  }
})

export default React.memo(MenuRow, (prev, next) => {
  let skipUpdate = true
  skipUpdate = prev.content === next.content
  return skipUpdate
})
