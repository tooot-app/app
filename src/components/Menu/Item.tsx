import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from 'src/utils/styles/ThemeManager'

import constants from 'src/utils/styles/constants'

export interface Props {
  icon?: string
  title: string
  navigateTo?: string
  navigateToParams?: {}
}

const Core: React.FC<Props> = ({ icon, title, navigateTo }) => {
  const { theme } = useTheme()

  return (
    <View style={styles.core}>
      {icon && (
        <Feather
          name={icon}
          size={constants.FONT_SIZE_M + 2}
          style={styles.iconLeading}
          color={theme.primary}
        />
      )}
      <Text style={{ color: theme.primary, fontSize: constants.FONT_SIZE_M }}>
        {title}
      </Text>
      {navigateTo && (
        <Feather
          name='chevron-right'
          size={24}
          color={theme.secondary}
          style={styles.iconNavigation}
        />
      )}
    </View>
  )
}

const MenuItem: React.FC<Props> = ({ ...props }) => {
  const { theme } = useTheme()
  const navigation = useNavigation()

  return props.navigateTo ? (
    <Pressable
      style={[styles.base, { borderBottomColor: theme.separator }]}
      onPress={() => {
        navigation.navigate(props.navigateTo!, props.navigateToParams)
      }}
    >
      <Core {...props} />
    </Pressable>
  ) : (
    <View style={styles.base}>
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
    alignItems: 'center',
    paddingLeft: constants.GLOBAL_PAGE_PADDING,
    paddingRight: constants.GLOBAL_PAGE_PADDING
  },
  iconLeading: {
    marginRight: 8
  },
  iconNavigation: {
    marginLeft: 'auto'
  }
})

export default MenuItem
