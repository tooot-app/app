import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { ColorDefinitions } from '@utils/styles/themes'
import React, { useMemo } from 'react'
import { StyleSheet, Switch, Text, View } from 'react-native'
import { Flow } from 'react-native-animated-spinkit'
import { State, TapGestureHandler } from 'react-native-gesture-handler'

export interface Props {
  iconFront?: any
  iconFrontColor?: ColorDefinitions

  title: string
  description?: string
  content?: string | React.ReactNode

  switchValue?: boolean
  switchDisabled?: boolean
  switchOnValueChange?: () => void

  iconBack?: 'ChevronRight' | 'ExternalLink'
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
        <Flow
          size={StyleConstants.Font.Size.M * 1.25}
          color={theme.secondary}
        />
      </View>
    ),
    [theme]
  )

  return (
    <View style={styles.base}>
      <TapGestureHandler
        onHandlerStateChange={({ nativeEvent }) =>
          nativeEvent.state === State.ACTIVE && !loading && onPress && onPress()
        }
      >
        <View style={styles.core}>
          <View style={styles.front}>
            {iconFront && (
              <Icon
                name={iconFront}
                size={StyleConstants.Font.Size.L}
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
            </View>
          </View>

          {content || switchValue !== undefined || iconBack ? (
            <View style={styles.back}>
              {content ? (
                typeof content === 'string' ? (
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
                ) : (
                  content
                )
              ) : null}
              {switchValue !== undefined ? (
                <Switch
                  value={switchValue}
                  onValueChange={switchOnValueChange}
                  disabled={switchDisabled}
                  trackColor={{ true: theme.blue, false: theme.disabled }}
                  style={{ opacity: loading ? 0 : 1 }}
                />
              ) : null}
              {iconBack ? (
                <Icon
                  name={iconBack}
                  size={StyleConstants.Font.Size.L}
                  color={theme[iconBackColor]}
                  style={[styles.iconBack, { opacity: loading ? 0 : 1 }]}
                />
              ) : null}
              {loading && loadingSpinkit}
            </View>
          ) : null}
        </View>
      </TapGestureHandler>
      {description ? (
        <Text style={[styles.description, { color: theme.secondary }]}>
          {description}
        </Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: 50
  },
  core: {
    flex: 1,
    flexDirection: 'row',
    paddingHorizontal: StyleConstants.Spacing.Global.PagePadding
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
    marginTop: StyleConstants.Spacing.XS,
    paddingHorizontal: StyleConstants.Spacing.Global.PagePadding
  },
  content: {
    ...StyleConstants.FontStyle.M
  },
  iconBack: {
    marginLeft: 8
  }
})

export default MenuRow
