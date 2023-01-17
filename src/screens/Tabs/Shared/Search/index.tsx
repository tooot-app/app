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
import React, { useEffect, useRef, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { KeyboardAvoidingView, Platform, SectionList, TextInput, View } from 'react-native'
import SearchEmpty from './Empty'

const TabSharedSearch: React.FC<TabSharedStackScreenProps<'Tab-Shared-Search'>> = ({
  navigation
}) => {
  const { t } = useTranslation('screenTabs')
  const { colors, mode } = useTheme()

  const inputRef = useRef<TextInput>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')
  useEffect(() => {
    navigation.setOptions({
      ...(Platform.OS === 'ios'
        ? {
            headerLeft: () => <HeaderLeft onPress={() => navigation.goBack()} />
          }
        : { headerLeft: () => null }),
      headerTitle: () => {
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
              ref={inputRef}
              accessibilityRole='search'
              style={{
                fontSize: StyleConstants.Font.Size.M,
                flex: 1,
                color: colors.primaryDefault,
                marginLeft: StyleConstants.Spacing.XS,
                paddingLeft: StyleConstants.Spacing.XS,
                paddingVertical: StyleConstants.Spacing.XS,
                borderBottomColor: colors.border,
                borderBottomWidth: 1
              }}
              onChangeText={debounce(
                text => {
                  setSearchTerm(text)
                  refetch()
                },
                1000,
                { trailing: true }
              )}
              autoCapitalize='none'
              autoCorrect={false}
              clearButtonMode='always'
              keyboardType='web-search'
              placeholder={t('shared.search.header.placeholder')}
              placeholderTextColor={colors.secondary}
              returnKeyType='search'
            />
          </View>
        )
      }
    })
  }, [mode])
  useEffect(() => {
    const unsubscribe = navigation.addListener('transitionEnd', e => {
      inputRef.current?.focus()
    })

    return unsubscribe
  }, [navigation])

  const mapKeyToTranslations = {
    accounts: t('shared.search.sections.accounts'),
    hashtags: t('shared.search.sections.hashtags'),
    statuses: t('shared.search.sections.statuses')
  }
  const { isFetching, data, refetch } = useSearchQuery<
    {
      title: string
      translation: string
      data: any[]
    }[]
  >({
    term: searchTerm,
    options: {
      enabled: !!searchTerm.length,
      select: data =>
        Object.keys(data as Mastodon.Results)
          .map(key => ({
            title: key,
            // @ts-ignore
            translation: mapKeyToTranslations[key],
            // @ts-ignore
            data: data[key]
          }))
          .filter(d => d.data.length)
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <SectionList
        sections={data || []}
        renderItem={({ item, section }: { item: any; section: any }) => {
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
        }}
        stickySectionHeadersEnabled
        ListEmptyComponent={<SearchEmpty isFetching={isFetching} searchTerm={searchTerm} />}
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
                  ns='screenTabs'
                  i18nKey='shared.search.notFound'
                  values={{ searchTerm, type: translation }}
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

export default TabSharedSearch
