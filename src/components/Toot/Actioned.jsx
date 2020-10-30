import React from 'react'
import PropTypes from 'prop-types'
import propTypesEmoji from 'src/prop-types/emoji'
import { StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'

import Emojis from './Emojis'

export default function Actioned ({
  action,
  name,
  emojis,
  notification = false
}) {
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
          <Emojis content={content} emojis={emojis} dimension={12} />
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

Actioned.propTypes = {
  action: PropTypes.oneOf(['favourite', 'follow', 'mention', 'poll', 'reblog'])
    .isRequired,
  name: PropTypes.string,
  emojis: PropTypes.arrayOf(propTypesEmoji),
  notification: PropTypes.bool
}
