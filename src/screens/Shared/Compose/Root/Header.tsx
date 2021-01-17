import { useAccountQuery } from '@utils/queryHooks/account'
import {
  getLocalActiveIndex,
  getLocalInstances,
  InstanceLocal
} from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Chase } from 'react-native-animated-spinkit'
import { useSelector } from 'react-redux'
import ComposeSpoilerInput from '../SpoilerInput'
import ComposeTextInput from '../TextInput'
import ComposeContext from '../utils/createContext'

const PostingAs: React.FC<{
  id: Mastodon.Account['id']
  domain: InstanceLocal['url']
}> = ({ id, domain }) => {
  const { theme } = useTheme()

  const { data, status } = useAccountQuery({ id })

  switch (status) {
    case 'loading':
      return (
        <Chase
          size={StyleConstants.Font.LineHeight.M - 2}
          color={theme.secondary}
        />
      )
    case 'success':
      return (
        <Text style={[styles.postingAsText, { color: theme.secondary }]}>
          用 @{data?.acct}@{domain} 发布
        </Text>
      )
    default:
      return null
  }
}

const ComposeRootHeader: React.FC = () => {
  const { composeState } = useContext(ComposeContext)
  const localActiveIndex = useSelector(getLocalActiveIndex)
  const localInstances = useSelector(getLocalInstances)

  return (
    <>
      {localActiveIndex !== null &&
        localInstances.length &&
        localInstances.length > 1 && (
          <View style={styles.postingAs}>
            <PostingAs
              id={localInstances[localActiveIndex].account.id}
              domain={localInstances[localActiveIndex].uri}
            />
          </View>
        )}
      {composeState.spoiler.active ? <ComposeSpoilerInput /> : null}
      <ComposeTextInput />
    </>
  )
}

const styles = StyleSheet.create({
  postingAs: {
    marginHorizontal: StyleConstants.Spacing.Global.PagePadding,
    marginTop: StyleConstants.Spacing.S
  },
  postingAsText: {
    ...StyleConstants.FontStyle.S
  }
})

export default ComposeRootHeader
