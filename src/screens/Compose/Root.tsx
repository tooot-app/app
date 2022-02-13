import ComponentSeparator from '@components/Separator'
import { useEmojisQuery } from '@utils/queryHooks/emojis'
import { useSearchQuery } from '@utils/queryHooks/search'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import { chunk, forEach, groupBy, sortBy } from 'lodash'
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react'
import {
  AccessibilityInfo,
  findNodeHandle,
  FlatList,
  StyleSheet,
  View
} from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import ComposeActions from './Root/Actions'
import ComposePosting from './Posting'
import ComposeRootFooter from './Root/Footer'
import ComposeRootHeader from './Root/Header'
import ComposeRootSuggestion from './Root/Suggestion'
import ComposeContext from './utils/createContext'
import ComposeDrafts from './Root/Drafts'
import FastImage from 'react-native-fast-image'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { ComposeState } from './utils/types'
import { useSelector } from 'react-redux'
import {
  getInstanceConfigurationStatusCharsURL,
  getInstanceFrequentEmojis
} from '@utils/slices/instancesSlice'
import { useTranslation } from 'react-i18next'

const prefetchEmojis = (
  sortedEmojis: NonNullable<ComposeState['emoji']['emojis']>,
  reduceMotionEnabled: boolean
) => {
  const prefetches: { uri: string }[] = []
  let requestedIndex = 0
  sortedEmojis.forEach(sorted => {
    sorted.data.forEach(emojis =>
      emojis.forEach(emoji => {
        if (requestedIndex > 40) {
          return
        }
        prefetches.push({
          uri: reduceMotionEnabled ? emoji.static_url : emoji.url
        })
        requestedIndex++
      })
    )
  })
  try {
    FastImage.preload(prefetches)
  } catch {}
}

export let instanceConfigurationStatusCharsURL = 23

const ComposeRoot = React.memo(
  () => {
    const { reduceMotionEnabled } = useAccessibility()
    const { colors } = useTheme()

    instanceConfigurationStatusCharsURL = useSelector(
      getInstanceConfigurationStatusCharsURL,
      () => true
    )

    const accessibleRefDrafts = useRef(null)
    const accessibleRefAttachments = useRef(null)
    const accessibleRefEmojis = useRef(null)

    useEffect(() => {
      const tagDrafts = findNodeHandle(accessibleRefDrafts.current)
      tagDrafts && AccessibilityInfo.setAccessibilityFocus(tagDrafts)
    }, [accessibleRefDrafts.current])

    const { composeState, composeDispatch } = useContext(ComposeContext)

    const { isFetching, data, refetch } = useSearchQuery({
      type:
        composeState.tag?.type === 'accounts' ||
        composeState.tag?.type === 'hashtags'
          ? composeState.tag.type
          : undefined,
      term: composeState.tag?.text.substring(1),
      options: { enabled: false }
    })

    useEffect(() => {
      if (
        (composeState.tag?.type === 'accounts' ||
          composeState.tag?.type === 'hashtags') &&
        composeState.tag?.text
      ) {
        refetch()
      }
    }, [composeState.tag])

    const { t } = useTranslation()
    const { data: emojisData } = useEmojisQuery({})
    const frequentEmojis = useSelector(getInstanceFrequentEmojis, () => true)
    useEffect(() => {
      if (emojisData && emojisData.length) {
        const sortedEmojis: {
          title: string
          data: Pick<Mastodon.Emoji, 'shortcode' | 'url' | 'static_url'>[][]
        }[] = []
        forEach(
          groupBy(sortBy(emojisData, ['category', 'shortcode']), 'category'),
          (value, key) =>
            sortedEmojis.push({ title: key, data: chunk(value, 5) })
        )
        if (frequentEmojis.length) {
          sortedEmojis.unshift({
            title: t('componentEmojis:frequentUsed'),
            data: chunk(
              frequentEmojis.map(e => e.emoji),
              5
            )
          })
        }
        composeDispatch({
          type: 'emoji',
          payload: { ...composeState.emoji, emojis: sortedEmojis }
        })
        prefetchEmojis(sortedEmojis, reduceMotionEnabled)
      }
    }, [emojisData, reduceMotionEnabled])

    const listEmpty = useMemo(() => {
      if (isFetching) {
        return (
          <View key='listEmpty' style={styles.loading}>
            <Circle
              size={StyleConstants.Font.Size.M * 1.25}
              color={colors.secondary}
            />
          </View>
        )
      }
    }, [isFetching])

    const listItem = useCallback(
      ({ item }) => (
        <ComposeRootSuggestion
          item={item}
          composeState={composeState}
          composeDispatch={composeDispatch}
        />
      ),
      [composeState]
    )

    const ListFooter = useCallback(
      () => (
        <ComposeRootFooter
          accessibleRefAttachments={accessibleRefAttachments}
          accessibleRefEmojis={accessibleRefEmojis}
        />
      ),
      []
    )

    return (
      <View style={styles.base}>
        <FlatList
          renderItem={listItem}
          ListEmptyComponent={listEmpty}
          keyboardShouldPersistTaps='always'
          ListHeaderComponent={ComposeRootHeader}
          ListFooterComponent={ListFooter}
          ItemSeparatorComponent={ComponentSeparator}
          // @ts-ignore
          data={data ? data[composeState.tag?.type] : undefined}
          keyExtractor={() => Math.random().toString()}
        />
        <ComposeActions />
        <ComposeDrafts accessibleRefDrafts={accessibleRefDrafts} />
        <ComposePosting />
      </View>
    )
  },
  () => true
)

const styles = StyleSheet.create({
  base: {
    flex: 1
  },
  contentView: { flex: 1 },
  loading: {
    flex: 1,
    alignItems: 'center'
  }
})

export default ComposeRoot
