import analytics from '@components/analytics'
import Button from '@components/Button'
import haptics from '@components/haptics'
import ComponentInstance from '@components/Instance'
import { useNavigation } from '@react-navigation/native'
import {
  getInstanceActive,
  getInstances,
  Instance,
  updateInstanceActive
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { groupBy } from 'lodash'
import React, { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, Text, View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'

interface Props {
  instance: Instance
  selected?: boolean
}

const AccountButton: React.FC<Props> = ({ instance, selected = false }) => {
  const queryClient = useQueryClient()
  const navigation = useNavigation()
  const dispatch = useDispatch()

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
        dispatch(updateInstanceActive(instance))
        queryClient.clear()
        navigation.goBack()
      }}
    />
  )
}

const ScreenMeSwitchRoot: React.FC = () => {
  const { t } = useTranslation('screenTabs')
  const { theme } = useTheme()
  const instances = useSelector(getInstances, () => true)
  const instanceActive = useSelector(getInstanceActive, () => true)

  const scrollViewRef = useRef<ScrollView>(null)

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.base}
      keyboardShouldPersistTaps='always'
    >
      <View style={[styles.firstSection, { borderBottomColor: theme.border }]}>
        <Text style={[styles.header, { color: theme.primaryDefault }]}>
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

      <View style={styles.secondSection}>
        <Text style={[styles.header, { color: theme.primaryDefault }]}>
          {t('me.switch.new')}
        </Text>
        <ComponentInstance
          scrollViewRef={scrollViewRef}
          disableHeaderImage
          goBack
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  base: {
    marginBottom: StyleConstants.Spacing.L
  },
  header: {
    ...StyleConstants.FontStyle.M,
    textAlign: 'center',
    paddingVertical: StyleConstants.Spacing.S
  },
  firstSection: {
    marginTop: StyleConstants.Spacing.S,
    marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
    paddingBottom: StyleConstants.Spacing.S,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  secondSection: {
    paddingTop: StyleConstants.Spacing.M
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

export default ScreenMeSwitchRoot
