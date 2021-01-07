import { useNavigation } from '@react-navigation/native'
import ComponentAccount from '@root/components/Account'
import ComponentSeparator from '@root/components/Separator'
import TimelineDefault from '@root/components/Timelines/Timeline/Default'
import hookSearch from '@utils/queryHooks/search'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { debounce } from 'lodash'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  KeyboardAvoidingView,
  Pressable,
  SectionList,
  StyleSheet,
  Text,
  View
} from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { TextInput } from 'react-native-gesture-handler'

const ScreenSharedSearch: React.FC = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const { status, data, refetch } = hookSearch({
    term: searchTerm,
    options: { enabled: false }
  })

  useEffect(() => {
    const updateHeaderRight = () =>
      navigation.setOptions({
        headerCenter: () => (
          <View style={styles.searchBar}>
            <Text
              style={{ ...StyleConstants.FontStyle.M, color: theme.primary }}
            >
              搜索
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: theme.primary
                }
              ]}
              autoFocus
              onChangeText={onChangeText}
              autoCapitalize='none'
              autoCorrect={false}
              clearButtonMode='never'
              keyboardType='web-search'
              onSubmitEditing={({ nativeEvent: { text } }) =>
                setSearchTerm(text)
              }
              placeholder={'些什么'}
              placeholderTextColor={theme.secondary}
              returnKeyType='go'
            />
          </View>
        )
      })
    return updateHeaderRight()
  }, [])

  const [setctionData, setSectionData] = useState<
    { title: string; data: any }[]
  >([])
  useEffect(
    () =>
      data &&
      setSectionData(
        Object.keys(data as Mastodon.Results)
          .map(key => ({
            title: key,
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

  const onChangeText = useCallback(
    debounce(text => setSearchTerm(text), 1000, {
      trailing: true
    }),
    []
  )
  useEffect(() => {
    if (searchTerm) {
      refetch()
    } else {
      setSectionData([])
    }
  }, [searchTerm])

  const listEmpty = useMemo(
    () => (
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
                输入关键词搜索<Text style={styles.emptyFontBold}>用户</Text>、
                <Text style={styles.emptyFontBold}>话题标签</Text>或者
                <Text style={styles.emptyFontBold}>嘟文</Text>
              </Text>
              <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
                高级搜索格式
              </Text>
              <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
                <Text style={{ color: theme.secondary }}>@username@domain</Text>
                {'   '}
                搜索用户
              </Text>
              <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
                <Text style={{ color: theme.secondary }}>#example</Text>
                {'   '}搜索话题标签
              </Text>
              <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
                <Text style={{ color: theme.secondary }}>URL</Text>
                {'   '}搜索指定嘟文
              </Text>
              <Text style={[styles.emptyAdvanced, { color: theme.primary }]}>
                <Text style={{ color: theme.secondary }}>URL</Text>
                {'   '}搜索指定用户
              </Text>
            </>
          )}
        </View>
      </View>
    ),
    [status]
  )
  const sectionHeader = useCallback(
    ({ section: { title } }) => (
      <View
        style={[styles.sectionHeader, { backgroundColor: theme.background }]}
      >
        <Text style={[styles.sectionHeaderText, { color: theme.primary }]}>
          {title}
        </Text>
      </View>
    ),
    []
  )
  const sectionFooter = useCallback(
    ({ section: { data, title } }) =>
      !data.length ? (
        <View
          style={[styles.sectionFooter, { backgroundColor: theme.background }]}
        >
          <Text style={[styles.sectionFooterText, { color: theme.secondary }]}>
            找不到{' '}
            <Text style={{ fontWeight: StyleConstants.Font.Weight.Bold }}>
              {searchTerm}
            </Text>{' '}
            相关的{title}
          </Text>
        </View>
      ) : null,
    [searchTerm]
  )
  const listItem = useCallback(({ item, section, index }) => {
    switch (section.title) {
      case 'accounts':
        return <ComponentAccount account={item} />
      case 'hashtags':
        return (
          <Pressable
            style={[styles.itemDefault, { borderBottomColor: theme.border }]}
            onPress={() => {
              navigation.goBack()
              navigation.push('Screen-Shared-Hashtag', {
                hashtag: item.name
              })
            }}
          >
            <Text style={[styles.itemHashtag, { color: theme.primary }]}>
              #{item.name}
            </Text>
          </Pressable>
        )
      case 'statuses':
        return <TimelineDefault item={item} index={index} disableDetails />
      default:
        return null
    }
  }, [])

  return (
    <KeyboardAvoidingView behavior='padding' style={{ flex: 1 }}>
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
  searchBar: {
    flexBasis: '80%',
    flexDirection: 'row',
    alignItems: 'center'
  },
  textInput: {
    ...StyleConstants.FontStyle.M,
    paddingLeft: StyleConstants.Spacing.XS,
    marginBottom:
      (StyleConstants.Font.LineHeight.M - StyleConstants.Font.Size.M) / 2
  },
  emptyBase: {
    marginVertical: StyleConstants.Spacing.Global.PagePadding,
    // paddingHorizontal: StyleConstants.Spacing.Global.PagePadding
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
  },
  itemDefault: {
    padding: StyleConstants.Spacing.S * 1.5,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  itemHashtag: {
    ...StyleConstants.FontStyle.M
  }
})

export default ScreenSharedSearch
