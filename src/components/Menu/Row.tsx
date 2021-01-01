import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { ColorDefinitions } from '@utils/styles/themes'
import React, { useMemo } from 'react'
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'

export interface Props {
  iconFront?: any
  iconFrontColor?: ColorDefinitions

  title: string
  description?: string
  content?: string

  switchValue?: boolean
  switchDisabled?: boolean
  switchOnValueChange?: () => void

  iconBack?: 'chevron-right' | 'check'
  iconBackColor?: ColorDefinitions

  loading?: boolean
  onPress?: () => void
}

const MenuRow: React.FC<Props> = ({
  iconFront,
  iconFrontColor = 'primary',
  title,
  description,
  content,
  switchValue,
  switchDisabled,
  switchOnValueChange,
  iconBack,
  iconBackColor = 'secondary',
  loading = false,
  onPress
}) => {
  const { theme } = useTheme()

  const loadingSpinkit = useMemo(
    () => (
      <View style={{ position: 'absolute' }}>
        <Chase
          size={StyleConstants.Font.Size.M * 1.25}
          color={theme.secondary}
        />
      </View>
    ),
    [theme]
  )

  return (
    <Pressable
      style={styles.base}
      onPress={onPress}
      disabled={loading}
      testID='base'
    >
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
          <View style={styles.main}>
            <Text
              style={[styles.title, { color: theme.primary }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {description ? (
              <Text style={[styles.description, { color: theme.secondary }]}>
                {description}
              </Text>
            ) : null}
          </View>
        </View>

        {(content && content.length) ||
        switchValue !== undefined ||
        iconBack ? (
          <View style={styles.back}>
            {content && content.length ? (
              <>
                <Text
                  style={[
                    styles.content,
                    {
                      color: theme.secondary,
                      opacity: !iconBack && loading ? 0 : 1
                    }
                  ]}
                  numberOfLines={1}
                >
                  {content}
                </Text>
                {loading && !iconBack && loadingSpinkit}
              </>
            ) : null}
            {switchValue !== undefined ? (
              <Switch
                value={switchValue}
                onValueChange={switchOnValueChange}
                disabled={switchDisabled}
                trackColor={{ true: theme.blue, false: theme.disabled }}
              />
            ) : null}
            {iconBack ? (
              <>
                <Feather
                  name={iconBack}
                  size={StyleConstants.Font.Size.M + 2}
                  color={theme[iconBackColor]}
                  style={[styles.iconBack, { opacity: loading ? 0 : 1 }]}
                />
                {loading && loadingSpinkit}
              </>
            ) : null}
          </View>
        ) : null}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    height: 50
  },
  core: {
    flex: 1,
    flexDirection: 'row',
    paddingLeft: StyleConstants.Spacing.Global.PagePadding,
    paddingRight: StyleConstants.Spacing.Global.PagePadding
  },
  front: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center'
  },
  back: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginLeft: StyleConstants.Spacing.M
  },
  iconFront: {
    marginRight: 8
  },
  main: {
    flex: 1
  },
  title: {
    ...StyleConstants.FontStyle.M
  },
  description: {
    ...StyleConstants.FontStyle.S,
    marginTop: StyleConstants.Spacing.XS
  },
  content: {
    ...StyleConstants.FontStyle.M
  },
  iconBack: {
    marginLeft: 8
  }
})

export default MenuRow
