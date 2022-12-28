import ComponentSeparator from '@components/Separator'
import { useSearchQuery } from '@utils/queryHooks/search'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext, useEffect, useMemo, useRef } from 'react'
import { AccessibilityInfo, findNodeHandle, FlatList, View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import ComposePosting from '../Posting'
import ComposeContext from '../utils/createContext'
import ComposeActions from './Actions'
import ComposeDrafts from './Drafts'
import ComposeRootFooter from './Footer'
import ComposeRootHeader from './Header'
import ComposeRootSuggestion from './Suggestion'

const ComposeRoot = () => {
  const { colors } = useTheme()

  const accessibleRefDrafts = useRef(null)
  const accessibleRefAttachments = useRef(null)

  useEffect(() => {
    const tagDrafts = findNodeHandle(accessibleRefDrafts.current)
    tagDrafts && AccessibilityInfo.setAccessibilityFocus(tagDrafts)
  }, [accessibleRefDrafts.current])

  const { composeState } = useContext(ComposeContext)

  const mapSchemaToType = () => {
    if (composeState.tag) {
      switch (composeState.tag?.schema) {
        case '@':
          return 'accounts'
        case '#':
          return 'hashtags'
      }
    } else {
      return undefined
    }
  }
  const { isFetching, data, refetch } = useSearchQuery({
    type: mapSchemaToType(),
    term: composeState.tag?.raw.substring(1),
    options: { enabled: false }
  })

  useEffect(() => {
    if (
      (composeState.tag?.schema === '@' || composeState.tag?.schema === '#') &&
      composeState.tag?.raw
    ) {
      refetch()
    }
  }, [composeState.tag])

  const listEmpty = useMemo(() => {
    if (isFetching) {
      return (
        <View key='listEmpty' style={{ flex: 1, alignItems: 'center' }}>
          <Circle size={StyleConstants.Font.Size.M * 1.25} color={colors.secondary} />
        </View>
      )
    }
  }, [isFetching])

  const Footer = useMemo(
    () => <ComposeRootFooter accessibleRefAttachments={accessibleRefAttachments} />,
    [accessibleRefAttachments.current]
  )

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        renderItem={({ item }) => <ComposeRootSuggestion item={item} />}
        ListEmptyComponent={listEmpty}
        keyboardShouldPersistTaps='always'
        ListHeaderComponent={ComposeRootHeader}
        ListFooterComponent={Footer}
        ItemSeparatorComponent={ComponentSeparator}
        // @ts-ignore
        data={data ? data[mapSchemaToType()] : undefined}
        keyExtractor={() => Math.random().toString()}
      />
      <ComposeActions />
      <ComposeDrafts accessibleRefDrafts={accessibleRefDrafts} />
      <ComposePosting />
    </View>
  )
}

export default ComposeRoot
