import AccountButton from '@components/AccountButton'
import ComponentInstance from '@components/Instance'
import CustomText from '@components/Text'
import { getReadableAccounts } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'

const TabMeSwitch: React.FC = () => {
  const { t } = useTranslation('screenTabs')
  const { colors } = useTheme()
  const accounts = getReadableAccounts()

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
            borderTopWidth: 1,
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
            {accounts.map((account, index) => {
              return <AccountButton key={index} account={account} />
            })}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default TabMeSwitch
