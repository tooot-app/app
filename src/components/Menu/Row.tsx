import { Feather } from '@expo/vector-icons'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { ColorDefinitions } from '@utils/styles/themes'
import React, { useMemo } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'

export interface Props {
  iconFront?: any
  iconFrontColor?: ColorDefinitions

  title: string
  content?: string

  iconBack?: 'chevron-right' | 'check'
  iconBackColor?: ColorDefinitions

  loading?: boolean
  onPress?: () => void
}

const MenuRow: React.FC<Props> = ({
  iconFront,
  iconFrontColor = 'primary',
  title,
  content,
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
          <Text
            style={[styles.text, { color: theme.primary }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>
        {(content || iconBack) && (
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
            {iconBack && (
              <>
                <Feather
                  name={iconBack}
                  size={StyleConstants.Font.Size.M + 2}
                  color={theme[iconBackColor]}
                  style={[styles.iconBack, { opacity: loading ? 0 : 1 }]}
                />
                {loading && loadingSpinkit}
              </>
            )}
          </View>
        )}
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
    ...StyleConstants.FontStyle.M
  },
  content: {
    ...StyleConstants.FontStyle.M
  },
  iconBack: {
    marginLeft: 8
  }
})

export default MenuRow
