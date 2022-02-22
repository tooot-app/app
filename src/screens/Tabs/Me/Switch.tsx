import analytics from '@components/analytics'
import Button from '@components/Button'
import haptics from '@components/haptics'
import ComponentInstance from '@components/Instance'
import { useNavigation } from '@react-navigation/native'
import initQuery from '@utils/initQuery'
import {
  getInstanceActive,
  getInstances,
  Instance
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'

interface Props {
  instance: Instance
  selected?: boolean
}

const AccountButton: React.FC<Props> = ({ instance, selected = false }) => {
  const navigation = useNavigation()

  return (
    <Button
      type='text'
      selected={selected}
      style={styles.button}
      content={`@${instance.account.acct}@${instance.uri}${
        selected ? ' ✓' : ''
      }`}
      onPress={() => {
        haptics('Light')
        analytics('switch_existing_press')
        initQuery({ instance, prefetch: { enabled: true } })
        navigation.goBack()
      }}
    />
  )
}

const TabMeSwitch: React.FC = () => {
  const { t } = useTranslation('screenTabs')
  const { colors } = useTheme()
  const instances = useSelector(getInstances, () => true)
  const instanceActive = useSelector(getInstanceActive, () => true)

  const scrollViewRef = useRef<ScrollView>(null)
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true })
  }, [])

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.base}
        keyboardShouldPersistTaps='always'
      >
        <View>
          <Text style={[styles.header, { color: colors.primaryDefault }]}>
            {t('me.switch.new')}
          </Text>
          <ComponentInstance
            scrollViewRef={scrollViewRef}
            disableHeaderImage
            goBack
          />
        </View>

        <View
          style={[styles.firstSection, , { borderTopColor: colors.border }]}
        >
          <Text style={[styles.header, { color: colors.primaryDefault }]}>
            {t('me.switch.existing')}
          </Text>
          <View style={styles.accountButtons}>
            {instances.length
              ? instances
                  .slice()
                  .sort((a, b) =>
                    `${a.uri}${a.account.acct}`.localeCompare(
                      `${b.uri}${b.account.acct}`
                    )
                  )
                  .map((instance, index) => {
                    const localAccount = instances[instanceActive!]
                    return (
                      <AccountButton
                        key={index}
                        instance={instance}
                        selected={
                          instance.url === localAccount.url &&
                          instance.token === localAccount.token &&
                          instance.account.id === localAccount.account.id
                        }
                      />
                    )
                  })
              : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  base: {
    marginBottom: StyleConstants.Spacing.L * 2
  },
  header: {
    ...StyleConstants.FontStyle.M,
    textAlign: 'center',
    paddingVertical: StyleConstants.Spacing.S
  },
  firstSection: {
    marginTop: StyleConstants.Spacing.S,
    paddingTop: StyleConstants.Spacing.M,
    marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  accountButtons: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: StyleConstants.Spacing.M
  },
  button: {
    marginBottom: StyleConstants.Spacing.M,
    marginRight: StyleConstants.Spacing.M
  }
})

export default TabMeSwitch
