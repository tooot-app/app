import AccountButton from '@components/AccountButton'
import ComponentInstance from '@components/Instance'
import CustomText from '@components/Text'
import { getGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

const TabMeSwitch: React.FC = () => {
  const { t } = useTranslation('screenTabs')
  const { colors } = useTheme()
  const accounts = getGlobalStorage.object('accounts')
  const accountActive = getGlobalStorage.string('account.active')

  const scrollViewRef = useRef<ScrollView>(null)
  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150)
  }, [scrollViewRef.current])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={{ marginBottom: StyleConstants.Spacing.L * 2 }}
        keyboardShouldPersistTaps='always'
      >
        <View>
          <CustomText
            fontStyle='M'
            style={{
              textAlign: 'center',
              paddingVertical: StyleConstants.Spacing.S,
              color: colors.primaryDefault
            }}
          >
            {t('me.switch.new')}
          </CustomText>
          <ComponentInstance scrollViewRef={scrollViewRef} disableHeaderImage goBack />
        </View>

        <View
          style={{
            marginTop: StyleConstants.Spacing.S,
            paddingTop: StyleConstants.Spacing.M,
            marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: colors.border
          }}
        >
          <CustomText
            fontStyle='M'
            style={{
              textAlign: 'center',
              paddingVertical: StyleConstants.Spacing.S,
              color: colors.primaryDefault
            }}
          >
            {t('me.switch.existing')}
          </CustomText>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginTop: StyleConstants.Spacing.M
            }}
          >
            {accounts
              .slice()
              .sort((a, b) => a.localeCompare(b))
              .map((account, index) => {
                return (
                  <AccountButton
                    key={index}
                    account={account}
                    selected={account === accountActive}
                  />
                )
              })}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default TabMeSwitch
