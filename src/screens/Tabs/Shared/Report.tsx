import ComponentAccount from '@components/Account'
import { HeaderLeft, HeaderRight } from '@components/Header'
import Selections from '@components/Selections'
import CustomText from '@components/Text'
import apiInstance from '@utils/api/instance'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useRulesQuery } from '@utils/queryHooks/reports'
import { searchFetchToot } from '@utils/queryHooks/search'
import { getAccountStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, TextInput, View } from 'react-native'
import { Switch } from 'react-native-gesture-handler'

const TabSharedReport: React.FC<TabSharedStackScreenProps<'Tab-Shared-Report'>> = ({
  navigation,
  route: {
    params: { account, status }
  }
}) => {
  console.log('account', account.id)
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  const [categories, setCategories] = useState<
    { selected: boolean; content: string; type: 'spam' | 'other' | 'violation' }[]
  >([
    { selected: true, content: t('screenTabs:shared.report.reasons.spam'), type: 'spam' },
    { selected: false, content: t('screenTabs:shared.report.reasons.other'), type: 'other' },
    { selected: false, content: t('screenTabs:shared.report.reasons.violation'), type: 'violation' }
  ])
  const [rules, setRules] = useState<{ selected: boolean; content: string; id: string }[]>([])
  const [forward, setForward] = useState<boolean>(true)
  const [comment, setComment] = useState('')

  const [isReporting, setIsReporting] = useState(false)
  useEffect(() => {
    navigation.setOptions({
      title: t('screenTabs:shared.report.name', { acct: `@${account.acct}` }),
      headerLeft: () => (
        <HeaderLeft
          type='text'
          content={t('common:buttons.cancel')}
          onPress={() => navigation.goBack()}
        />
      ),
      headerRight: () => (
        <HeaderRight
          type='text'
          content={t('screenTabs:shared.report.report')}
          destructive
          onPress={async () => {
            const body = new FormData()
            if (status) {
              if (status._remote) {
                const fetchedStatus = await searchFetchToot(status.uri)
                if (fetchedStatus) {
                  body.append('status_ids[]', fetchedStatus.id)
                }
              } else {
                body.append('status_ids[]', status.id)
              }
            }
            body.append('account_id', account.id)
            comment.length && body.append('comment', comment)
            body.append('forward', forward.toString())
            body.append('category', categories.find(category => category.selected)?.type || 'other')
            rules.filter(rule => rule.selected).forEach(rule => body.append('rule_ids[]', rule.id))

            apiInstance({ method: 'post', url: 'reports', body })
              .then(() => {
                setIsReporting(false)
                navigation.pop(1)
              })
              .catch(() => {
                setIsReporting(false)
              })
          }}
          loading={isReporting}
        />
      )
    })
  }, [isReporting, comment, forward, categories, rules, account.id])

  const localInstance = account?.acct.includes('@')
    ? account?.acct.includes(`@${getAccountStorage.string('auth.account.domain')}`)
    : true

  const rulesQuery = useRulesQuery()
  useEffect(() => {
    if (rulesQuery.data) {
      setRules(rulesQuery.data.map(rule => ({ ...rule, selected: false, content: rule.text })))
    }
  }, [rulesQuery.data])

  return (
    <ScrollView>
      <View
        style={{
          margin: StyleConstants.Spacing.Global.PagePadding,
          borderWidth: 1,
          borderColor: colors.red,
          borderRadius: 8
        }}
      >
        <ComponentAccount account={account} props={{}} />
      </View>
      <View
        style={{
          paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
          marginTop: StyleConstants.Spacing.M
        }}
      >
        {!localInstance ? (
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: StyleConstants.Spacing.L
            }}
          >
            <CustomText
              fontStyle='M'
              style={{ color: colors.primaryDefault, paddingRight: StyleConstants.Spacing.M }}
              numberOfLines={2}
            >
              {t('screenTabs:shared.report.forward.heading', {
                instance: account.acct.match(/@(.*)/)?.[1]
              })}
            </CustomText>
            <Switch
              value={forward}
              onValueChange={setForward}
              trackColor={{ true: colors.blue, false: colors.disabled }}
            />
          </View>
        ) : null}

        <CustomText
          fontStyle='M'
          style={{ color: colors.primaryDefault, marginBottom: StyleConstants.Spacing.S }}
        >
          {t('screenTabs:shared.report.reasons.heading')}
        </CustomText>
        <View style={{ marginLeft: StyleConstants.Spacing.M }}>
          <Selections options={categories} setOptions={setCategories} />
        </View>

        {categories[1].selected || comment.length ? (
          <>
            <CustomText
              fontStyle='M'
              style={{
                color: colors.primaryDefault,
                marginTop: StyleConstants.Spacing.M,
                marginBottom: StyleConstants.Spacing.XS
              }}
            >
              {t('screenTabs:shared.report.comment.heading')}
            </CustomText>
            <View
              style={{
                borderWidth: 1,
                marginVertical: StyleConstants.Spacing.S,
                padding: StyleConstants.Spacing.S,
                borderColor: colors.border,
                flexDirection: 'column',
                alignItems: 'stretch'
              }}
            >
              <TextInput
                style={{
                  flex: 1,
                  fontSize: StyleConstants.Font.Size.M,
                  color: colors.primaryDefault,
                  minHeight:
                    Platform.OS === 'ios' ? StyleConstants.Font.LineHeight.M * 5 : undefined
                }}
                value={comment}
                onChangeText={setComment}
                multiline={true}
                numberOfLines={Platform.OS === 'android' ? 5 : undefined}
                textAlignVertical='top'
              />

              <View style={{ flexDirection: 'row', alignSelf: 'flex-end' }}>
                <CustomText
                  fontStyle='S'
                  style={{ paddingLeft: StyleConstants.Spacing.XS, color: colors.secondary }}
                >
                  {comment.length} / 1000
                </CustomText>
              </View>
            </View>
          </>
        ) : null}

        {rules.length ? (
          <>
            <CustomText
              fontStyle='M'
              style={{
                color: categories[2].selected ? colors.primaryDefault : colors.disabled,
                marginTop: StyleConstants.Spacing.M,
                marginBottom: StyleConstants.Spacing.S
              }}
            >
              {t('screenTabs:shared.report.violatedRules.heading')}
            </CustomText>
            <View style={{ marginLeft: StyleConstants.Spacing.M }}>
              <Selections
                disabled={!categories[2].selected}
                multiple
                options={rules}
                setOptions={setRules}
              />
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  )
}

export default TabSharedReport
