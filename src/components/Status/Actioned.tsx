import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import Emojis from './Emojis'

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
  let icon
  let content
  switch (action) {
    case 'favourite':
      icon = (
        <Feather name='heart' size={12} color='black' style={styles.icon} />
      )
      content = `${name} 喜欢了你的嘟嘟`
      break
    case 'follow':
      icon = (
        <Feather name='user-plus' size={12} color='black' style={styles.icon} />
      )
      content = `${name} 开始关注你`
      break
    case 'poll':
      icon = (
        <Feather
          name='bar-chart-2'
          size={12}
          color='black'
          style={styles.icon}
        />
      )
      content = `你参与的投票已结束`
      break
    case 'reblog':
      icon = (
        <Feather name='repeat' size={12} color='black' style={styles.icon} />
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
            <Emojis content={content} emojis={emojis} dimension={12} />
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
    marginBottom: 8
  },
  icon: {
    marginLeft: 50 - 12,
    marginRight: 8
  },
  content: {
    flexDirection: 'row'
  }
})

export default Actioned
