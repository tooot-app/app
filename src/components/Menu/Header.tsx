import React from 'react'
import { StyleSheet, Text } from 'react-native'

export interface Props {
  heading: string
}

const MenuHeader: React.FC<Props> = ({ heading }) => {
  return <Text style={styles.header}>{heading}</Text>
}

const styles = StyleSheet.create({
  header: {
    marginTop: 12,
    paddingLeft: 12,
    paddingRight: 12
  }
})

export default MenuHeader
