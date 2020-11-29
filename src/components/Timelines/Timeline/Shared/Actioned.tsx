import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import Emojis from './Emojis'
import { useTheme } from 'src/utils/styles/ThemeManager'
import { StyleConstants } from 'src/utils/styles/constants'

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
          size={StyleConstants.Font.Size.S}
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
          size={StyleConstants.Font.Size.S}
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
          size={StyleConstants.Font.Size.S}
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
          size={StyleConstants.Font.Size.S}
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
              size={StyleConstants.Font.Size.S}
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
    marginBottom: StyleConstants.Spacing.S
  },
  icon: {
    marginLeft: StyleConstants.Avatar.S - StyleConstants.Font.Size.S,
    marginRight: StyleConstants.Spacing.S
  },
  content: {
    flexDirection: 'row'
  }
})

export default React.memo(Actioned)
