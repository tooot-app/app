import { Feather } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import { HeaderRight } from '@root/components/Header'
import { MenuHeader, MenuRow } from '@root/components/Menu'
import { searchFetch } from '@root/utils/fetches/searchFetch'
import { StyleConstants } from '@root/utils/styles/constants'
import { useTheme } from '@root/utils/styles/ThemeManager'
import { debounce } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { SectionList, StyleSheet, Text, TextInput, View } from 'react-native'
import { useQuery } from 'react-query'

const ScreenSharedSearch: React.FC = () => {
  const navigation = useNavigation()
  const { theme } = useTheme()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const { isFetching, data, refetch } = useQuery(
    ['Search', { term: searchTerm }],
    searchFetch,
    { enabled: false }
  )
  const transformData = () => {
    return data
      ? Object.keys(data as Mastodon.Results)
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
      : []
  }

  const onChangeText = useCallback(
    debounce(
      text => {
        setSearchTerm(text)
        if (text) {
          refetch()
        }
      },
      1000,
      {
        trailing: true
      }
    ),
    []
  )

  const listEmpty = useMemo(
    () => (
      <View style={styles.emptyBase}>
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
      </View>
    ),
    []
  )

  return (
    <>
      <View style={styles.searchBar}>
        <View
          style={[styles.searchField, { borderBottomColor: theme.secondary }]}
        >
          <Feather
            name='search'
            color={theme.primary}
            size={StyleConstants.Font.Size.M}
            style={styles.searchIcon}
          />
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
            // onSubmitEditing={() =>
            //   instanceQuery.isSuccess &&
            //   instanceQuery.data &&
            //   instanceQuery.data.uri &&
            //   applicationQuery.refetch()
            // }
            placeholder={'搜索些什么'}
            placeholderTextColor={theme.secondary}
            returnKeyType='go'
          />
        </View>
        <View style={styles.searchCancel}>
          <HeaderRight text='取消' onPress={() => navigation.goBack()} />
        </View>
      </View>
      <SectionList
        ListEmptyComponent={listEmpty}
        style={styles.base}
        sections={transformData()}
        refreshing={isFetching}
        keyExtractor={(item, index) => item + index}
        renderSectionHeader={({ section: { title } }) => (
          <MenuHeader heading={title} />
        )}
        renderItem={({ item, section }) => {
          switch (section.title) {
            case 'accounts':
              return <Text>{item.display_name || item.username}</Text>
            case 'statuses':
              return <Text>{item.id || 'empty'}</Text>
            case 'hashtags':
              return <MenuRow title={item.name} />
            default:
              return null
          }
        }}
        stickySectionHeadersEnabled
      />
    </>
  )
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    padding: StyleConstants.Spacing.Global.PagePadding
  },
  searchBar: {
    padding: StyleConstants.Spacing.Global.PagePadding,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center'
  },
  searchField: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1.25
  },
  searchIcon: {
    marginLeft: StyleConstants.Spacing.S
  },
  searchCancel: {
    paddingHorizontal: StyleConstants.Spacing.S,
    marginLeft: StyleConstants.Spacing.S
  },
  textInput: {
    flex: 1,
    padding: StyleConstants.Spacing.S,
    fontSize: StyleConstants.Font.Size.M,
    marginRight: StyleConstants.Spacing.S
  },

  emptyBase: {
    marginTop: StyleConstants.Spacing.S,
    marginLeft:
      StyleConstants.Spacing.S +
      StyleConstants.Spacing.M +
      StyleConstants.Spacing.S
  },
  emptyFontSize: { fontSize: StyleConstants.Font.Size.S },
  emptyFontBold: {
    fontWeight: StyleConstants.Font.Weight.Bold
  },
  emptyDefault: {
    marginBottom: StyleConstants.Spacing.L
  },
  emptyAdvanced: {
    marginBottom: StyleConstants.Spacing.S
  }
})

export default ScreenSharedSearch
