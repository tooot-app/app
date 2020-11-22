import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Feather } from '@expo/vector-icons'
import { useTheme } from 'src/utils/styles/ThemeManager'

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
      {icon && <Feather name={icon} size={24} style={styles.iconLeading} />}
      <Text>{title}</Text>
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
  const navigation = useNavigation()

  return props.navigateTo ? (
    <Pressable
      style={styles.base}
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
    borderBottomColor: 'lightgray',
    borderBottomWidth: 1
  },
  core: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 12,
    paddingRight: 12
  },
  iconLeading: {
    marginRight: 8
  },
  iconNavigation: {
    marginLeft: 'auto'
  }
})

export default MenuItem
