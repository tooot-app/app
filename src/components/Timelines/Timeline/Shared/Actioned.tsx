import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import Emojis from './Emojis'
import { useTheme } from 'src/utils/styles/ThemeManager'

import constants from 'src/utils/styles/constants'

export interface Props {
  action: 'favourite' | 'follow' | 'mention' | 'poll' | 'reblog'
  name?: string
  emojis?: Mastodon.Emoji[]
  notification?: boolean
}

const Actioned: React.FC<Props> = ({
  action,
  name,
  emojis,
  notification = false
}) => {
  const { theme } = useTheme()
  const iconColor = theme.primary

  let icon
  let content
  switch (action) {
    case 'favourite':
      icon = (
        <Feather
          name='heart'
          size={constants.FONT_SIZE_S}
          color={iconColor}
          style={styles.icon}
        />
      )
      content = `${name} 喜欢了你的嘟嘟`
      break
    case 'follow':
      icon = (
        <Feather
          name='user-plus'
          size={constants.FONT_SIZE_S}
          color={iconColor}
          style={styles.icon}
        />
      )
      content = `${name} 开始关注你`
      break
    case 'poll':
      icon = (
        <Feather
          name='bar-chart-2'
          size={constants.FONT_SIZE_S}
          color='black'
          style={styles.icon}
        />
      )
      content = `你参与的投票已结束`
      break
    case 'reblog':
      icon = (
        <Feather
          name='repeat'
          size={constants.FONT_SIZE_S}
          color={iconColor}
          style={styles.icon}
        />
      )
      content = `${name} 转嘟了${notification ? '你的嘟嘟' : ''}`
      break
  }

  return (
    <View style={styles.actioned}>
      {icon}
      {content ? (
        <View style={styles.content}>
          {emojis ? (
            <Emojis
              content={content}
              emojis={emojis}
              size={constants.FONT_SIZE_S}
            />
          ) : (
            <Text>{content}</Text>
          )}
        </View>
      ) : (
        <></>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  actioned: {
    flexDirection: 'row',
    marginBottom: constants.SPACING_S
  },
  icon: {
    marginLeft: constants.AVATAR_S - constants.FONT_SIZE_S,
    marginRight: constants.SPACING_S
  },
  content: {
    flexDirection: 'row'
  }
})

export default React.memo(Actioned)
