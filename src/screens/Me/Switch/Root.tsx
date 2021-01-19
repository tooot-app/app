import Button from '@components/Button'
import ComponentInstance from '@components/Instance'
import { useNavigation } from '@react-navigation/native'
import { useAccountCheckQuery } from '@utils/queryHooks/accountCheck'
import {
  getLocalActiveIndex,
  getLocalInstances,
  InstanceLocal,
  InstancesState,
  localUpdateActiveIndex
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { useQueryClient } from 'react-query'
import { useDispatch, useSelector } from 'react-redux'

interface Props {
  index: NonNullable<InstancesState['local']['activeIndex']>
  instance: InstanceLocal
  disabled?: boolean
}

const AccountButton: React.FC<Props> = ({
  index,
  instance,
  disabled = false
}) => {
  const queryClient = useQueryClient()
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const { isLoading, data } = useAccountCheckQuery({
    id: instance.account.id,
    index,
    options: { retry: false }
  })

  return (
    <Button
      type='text'
      disabled={disabled}
      loading={isLoading}
      style={styles.button}
      content={`@${data?.acct || '...'}@${instance.url}`}
      onPress={() => {
        dispatch(localUpdateActiveIndex(index))
        queryClient.clear()
        navigation.goBack()
      }}
    />
  )
}

const ScreenMeSwitchRoot: React.FC = () => {
  const { t } = useTranslation('meSwitch')
  const { theme } = useTheme()
  const localInstances = useSelector(getLocalInstances)
  const localActiveIndex = useSelector(getLocalActiveIndex)

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView keyboardShouldPersistTaps='handled'>
        <View
          style={[styles.firstSection, { borderBottomColor: theme.border }]}
        >
          <Text style={[styles.header, { color: theme.primary }]}>
            {t('content.existing')}
          </Text>
          <View style={styles.accountButtons}>
            {localInstances.length
              ? localInstances.map((instance, index) => (
                  <AccountButton
                    key={index}
                    index={index}
                    instance={instance}
                    disabled={localActiveIndex === index}
                  />
                ))
              : null}
          </View>
        </View>

        <View style={styles.secondSection}>
          <Text style={[styles.header, { color: theme.primary }]}>
            {t('content.new')}
          </Text>
          <ComponentInstance type='local' disableHeaderImage goBack />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
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
    marginBottom: StyleConstants.Spacing.M
  }
})

export default ScreenMeSwitchRoot
