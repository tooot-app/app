import React, { useEffect, useRef } from 'react'
import { AccessibilityInfo, findNodeHandle, ScrollView, View } from 'react-native'
import ComposePosting from '../Posting'
import ComposeActions from './Actions'
import ComposeDrafts from './Drafts'
import ComposeRootFooter from './Footer'
import ComposeRootHeader from './Header'
import ComposeRootSuggestion from './Suggestions'

const ComposeRoot = () => {
  const accessibleRefDrafts = useRef(null)
  const accessibleRefAttachments = useRef(null)

  useEffect(() => {
    const tagDrafts = findNodeHandle(accessibleRefDrafts.current)
    tagDrafts && AccessibilityInfo.setAccessibilityFocus(tagDrafts)
  }, [accessibleRefDrafts.current])

  return (
    <>
      <ScrollView keyboardShouldPersistTaps='always' style={{ marginBottom: 50 }}>
        <ComposeRootHeader />
        <ComposeRootSuggestion />
        <ComposeRootFooter accessibleRefAttachments={accessibleRefAttachments} />
      </ScrollView>
      <ComposeDrafts accessibleRefDrafts={accessibleRefDrafts} />
      <ComposePosting />
      <ComposeActions />
    </>
  )
}

export default ComposeRoot
