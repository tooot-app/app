import ComponentAccount from '@components/Account'
import analytics from '@components/analytics'
import ComponentHashtag from '@components/Hashtag'
import ComponentSeparator from '@components/Separator'
import TimelineDefault from '@components/Timelines/Timeline/Default'
import { useSearchQuery } from '@utils/queryHooks/search'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  KeyboardAvoidingView,
  Platform,
  SectionList,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { Chase } from 'react-native-animated-spinkit'

export interface Props {
  searchTerm: string | undefined
}

const ScreenSharedSearch: React.FC<Props> = ({ searchTerm }) => {
  const { t } = useTranslation('sharedSearch')
  const { theme } = useTheme()
  const { status, data, refetch } = useSearchQuery({
    term: searchTerm,
    options: { enabled: false }
  })

  const [setctionData, setSectionData] = useState<
    { title: string; data: any }[]
  >([])
  const mapKeyToTranslations = {
    accounts: t('content.sections.accounts'),
    hashtags: t('content.sections.hashtags'),
    statuses: t('content.sections.statuses')
  }
  useEffect(
    () =>
      data &&
      setSectionData(
        Object.keys(data as Mastodon.Results)
          .map(key => ({
            title: key,
            // @ts-ignore
            translation: mapKeyToTranslations[key],
            // @ts-ignore
            data: data[key]
          }))
          .sort((a, b) => {
            if (!a.data.length) {
              return 1
            } else if (!b.data.length) {
              return -1
            } else {
              return 0
            }
          })
      ),
    [data]
  )

  useEffect(() => {
    if (searchTerm) {
      refetch()
    } else {
      setSectionData([])
    }
  }, [searchTerm])

  const listEmpty = useMemo(() => {
    return (
      <View style={styles.emptyBase}>
        <View>
          {status === 'loading' ? (
            <View style={styles.loading}>
              <Chase
                size={StyleConstants.Font.Size.M * 1.25}
                color={theme.secondary}
              />
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.emptyDefault,
                  styles.emptyFontSize,
                  { color: theme.primary }
                ]}
              >
                <Trans
                  i18nKey='sharedSearch:content.empty.general'
                  components={{ bold: <Text style={styles.emptyFontBold} /> }}
                />
              </Text>
              <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
                {t('content.empty.advanced.header')}
              </Text>
              <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
                <Text style={{ color: theme.secondary }}>@username@domain</Text>
                {'   '}
                {t('content.empty.advanced.example.account')}
              </Text>
              <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
                <Text style={{ color: theme.secondary }}>#example</Text>
                {'   '}
                {t('content.empty.advanced.example.hashtag')}
              </Text>
              <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
                <Text style={{ color: theme.secondary }}>URL</Text>
                {'   '}
                {t('content.empty.advanced.example.statusLink')}
              </Text>
              <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
                <Text style={{ color: theme.secondary }}>URL</Text>
                {'   '}
                {t('content.empty.advanced.example.accountLink')}
              </Text>
            </>
          )}
        </View>
      </View>
    )
  }, [status])
  const sectionHeader = useCallback(
    ({ section: { translation } }) => (
      <View
        style={[styles.sectionHeader, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.sectionHeaderText, { color: theme.primary }]}>
          {translation}
        </Text>
      </View>
    ),
    []
  )
  const sectionFooter = useCallback(
    ({ section: { data, translation } }) =>
      !data.length ? (
        <View
          style={[styles.sectionFooter, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.sectionFooterText, { color: theme.secondary }]}>
            <Trans
              i18nKey='sharedSearch:content.notFound'
              values={{ searchTerm, type: translation }}
              components={{ bold: <Text style={styles.emptyFontBold} /> }}
            />
          </Text>
        </View>
      ) : null,
    [searchTerm]
  )
  const listItem = useCallback(({ item, section }) => {
    switch (section.title) {
      case 'accounts':
        return <ComponentAccount account={item} origin='search' />
      case 'hashtags':
        return <ComponentHashtag hashtag={item} origin='search' />
      case 'statuses':
        return <TimelineDefault item={item} disableDetails origin='search' />
      default:
        return null
    }
  }, [])

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SectionList
        style={styles.base}
        renderItem={listItem}
        stickySectionHeadersEnabled
        sections={setctionData}
        ListEmptyComponent={listEmpty}
        keyboardShouldPersistTaps='always'
        renderSectionHeader={sectionHeader}
        renderSectionFooter={sectionFooter}
        keyExtractor={(item, index) => item + index}
        SectionSeparatorComponent={ComponentSeparator}
        ItemSeparatorComponent={ComponentSeparator}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  base: {
    minHeight: '100%'
  },
  emptyBase: {
    marginVertical: StyleConstants.Spacing.Global.PagePadding,
    alignItems: 'center'
  },
  loading: { flex: 1, alignItems: 'center' },
  emptyFontSize: { ...StyleConstants.FontStyle.S },
  emptyFontBold: {
    fontWeight: StyleConstants.Font.Weight.Bold
  },
  emptyDefault: {
    marginBottom: StyleConstants.Spacing.L
  },
  emptyAdvanced: {
    marginBottom: StyleConstants.Spacing.S
  },
  sectionHeader: {
    padding: StyleConstants.Spacing.M
  },
  sectionHeaderText: {
    ...StyleConstants.FontStyle.M,
    fontWeight: StyleConstants.Font.Weight.Bold,
    textAlign: 'center'
  },
  sectionFooter: {
    padding: StyleConstants.Spacing.S
  },
  sectionFooterText: {
    ...StyleConstants.FontStyle.S,
    textAlign: 'center'
  }
})

export default ScreenSharedSearch
