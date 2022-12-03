import ComponentAccount from '@components/Account'
import ComponentHashtag from '@components/Hashtag'
import { HeaderLeft } from '@components/Header'
import ComponentSeparator from '@components/Separator'
import CustomText from '@components/Text'
import TimelineDefault from '@components/Timeline/Default'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { useSearchQuery } from '@utils/queryHooks/search'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useMemo } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import {
  KeyboardAvoidingView,
  Platform,
  SectionList,
  StyleSheet,
  TextInput,
  View
} from 'react-native'
import { Circle } from 'react-native-animated-spinkit'

const TabSharedSearch: React.FC<TabSharedStackScreenProps<'Tab-Shared-Search'>> = ({
  navigation,
  route: {
    params: { text }
  }
}) => {
  const { t } = useTranslation('screenTabs')
  const { colors, mode } = useTheme()

  useEffect(() => {
    navigation.setOptions({
      ...(Platform.OS === 'ios'
        ? {
            headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
          }
        : { headerLeft: () => null }),
      headerTitle: () => {
        const onChangeText = debounce((text: string) => navigation.setParams({ text }), 1000, {
          trailing: true
        })
        return (
          <View
            style={{
              flexBasis: '80%',
              flexDirection: 'row',
              alignItems: 'center'
            }}
          >
            <TextInput
              editable={false}
              style={{
                fontSize: StyleConstants.Font.Size.M,
                color: colors.primaryDefault
              }}
              defaultValue={t('shared.search.header.prefix')}
            />
            <TextInput
              accessibilityRole='search'
              keyboardAppearance={mode}
              style={{
                fontSize: StyleConstants.Font.Size.M,
                flex: 1,
                color: colors.primaryDefault,
                paddingLeft: StyleConstants.Spacing.XS
              }}
              autoFocus
              onChangeText={onChangeText}
              autoCapitalize='none'
              autoCorrect={false}
              clearButtonMode='never'
              keyboardType='web-search'
              onSubmitEditing={({ nativeEvent: { text } }) => navigation.setParams({ text })}
              placeholder={t('shared.search.header.placeholder')}
              placeholderTextColor={colors.secondary}
              returnKeyType='go'
            />
          </View>
        )
      }
    })
  }, [mode])

  const mapKeyToTranslations = {
    accounts: t('shared.search.sections.accounts'),
    hashtags: t('shared.search.sections.hashtags'),
    statuses: t('shared.search.sections.statuses')
  }
  const { status, data } = useSearchQuery<
    {
      title: string
      translation: string
      data: any[]
    }[]
  >({
    term: text,
    options: {
      enabled: text !== undefined,
      select: data =>
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
    }
  })

  const listEmpty = useMemo(() => {
    return (
      <View
        style={{
          marginVertical: StyleConstants.Spacing.Global.PagePadding,
          alignItems: 'center'
        }}
      >
        <View>
          {status === 'loading' ? (
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Circle size={StyleConstants.Font.Size.M * 1.25} color={colors.secondary} />
            </View>
          ) : (
            <>
              <CustomText
                fontStyle='S'
                style={{
                  marginBottom: StyleConstants.Spacing.L,
                  color: colors.primaryDefault
                }}
              >
                <Trans
                  i18nKey='screenTabs:shared.search.empty.general'
                  components={{
                    bold: <CustomText fontWeight='Bold' />
                  }}
                />
              </CustomText>
              <CustomText style={[styles.emptyAdvanced, { color: colors.primaryDefault }]}>
                {t('shared.search.empty.advanced.header')}
              </CustomText>
              <CustomText style={[styles.emptyAdvanced, { color: colors.primaryDefault }]}>
                <CustomText style={{ color: colors.secondary }}>@username@domain</CustomText>
                {'   '}
                {t('shared.search.empty.advanced.example.account')}
              </CustomText>
              <CustomText style={[styles.emptyAdvanced, { color: colors.primaryDefault }]}>
                <CustomText style={{ color: colors.secondary }}>#example</CustomText>
                {'   '}
                {t('shared.search.empty.advanced.example.hashtag')}
              </CustomText>
              <CustomText style={[styles.emptyAdvanced, { color: colors.primaryDefault }]}>
                <CustomText style={{ color: colors.secondary }}>URL</CustomText>
                {'   '}
                {t('shared.search.empty.advanced.example.statusLink')}
              </CustomText>
              <CustomText style={[styles.emptyAdvanced, { color: colors.primaryDefault }]}>
                <CustomText style={{ color: colors.secondary }}>URL</CustomText>
                {'   '}
                {t('shared.search.empty.advanced.example.accountLink')}
              </CustomText>
            </>
          )}
        </View>
      </View>
    )
  }, [status])

  const listItem = useCallback(({ item, section }: { item: any; section: any }) => {
    switch (section.title) {
      case 'accounts':
        return <ComponentAccount account={item} />
      case 'hashtags':
        return <ComponentHashtag hashtag={item} />
      case 'statuses':
        return <TimelineDefault item={item} disableDetails />
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
        style={{ minHeight: '100%' }}
        renderItem={listItem}
        stickySectionHeadersEnabled
        sections={data || []}
        ListEmptyComponent={listEmpty}
        keyboardShouldPersistTaps='always'
        renderSectionHeader={({ section: { translation } }) => (
          <View
            style={{
              padding: StyleConstants.Spacing.M,
              backgroundColor: colors.backgroundDefault
            }}
          >
            <CustomText
              fontStyle='M'
              style={{
                textAlign: 'center',
                color: colors.primaryDefault
              }}
              fontWeight='Bold'
            >
              {translation}
            </CustomText>
          </View>
        )}
        renderSectionFooter={({ section: { data, translation } }) =>
          !data.length ? (
            <View
              style={{
                padding: StyleConstants.Spacing.S,
                backgroundColor: colors.backgroundDefault
              }}
            >
              <CustomText fontStyle='S' style={{ textAlign: 'center', color: colors.secondary }}>
                <Trans
                  i18nKey='screenTabs:shared.search.notFound'
                  values={{ searchTerm: text, type: translation }}
                  components={{
                    bold: <CustomText fontWeight='Bold' />
                  }}
                />
              </CustomText>
            </View>
          ) : null
        }
        keyExtractor={(item, index) => item + index}
        SectionSeparatorComponent={ComponentSeparator}
        ItemSeparatorComponent={ComponentSeparator}
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  emptyAdvanced: {
    marginBottom: StyleConstants.Spacing.S
  }
})

export default TabSharedSearch
