import analytics from '@components/analytics'
import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as WebBrowser from 'expo-web-browser'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, Text } from 'react-native'

export interface Props {
  agreed: boolean
  setAgreed: React.Dispatch<React.SetStateAction<boolean>>
}

const EULA = React.memo(
  ({ agreed, setAgreed }: Props) => {
    const { t } = useTranslation('componentInstance')
    const { theme } = useTheme()

    return (
      <Pressable style={styles.base} onPress={() => setAgreed(!agreed)}>
        <Icon
          style={styles.icon}
          name={agreed ? 'CheckCircle' : 'Circle'}
          size={StyleConstants.Font.Size.M}
          color={theme.primary}
        />
        <Text style={[styles.text, { color: theme.primary }]}>
          {t('server.EULA.base')}
          <Text
            style={{ color: theme.blue }}
            children={t('server.EULA.EULA')}
            onPress={() => {
              analytics('view_EULA')
              WebBrowser.openBrowserAsync(
                'https://tooot.app/end-user-license-agreement'
              )
            }}
          />
        </Text>
      </Pressable>
    )
  },
  (prev, next) => prev.agreed === next.agreed
)

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    marginTop: StyleConstants.Spacing.M,
    paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
    alignItems: 'center'
  },
  icon: {
    marginRight: StyleConstants.Spacing.XS
  },
  text: {
    ...StyleConstants.FontStyle.S
  }
})

export default EULA
