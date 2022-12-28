import React, { useContext } from 'react'
import { View } from 'react-native'
import ComposeContext from '../../utils/createContext'
import ComposePostingAs from './PostingAs'
import ComposeSpoilerInput from './SpoilerInput'
import ComposeTextInput from './TextInput'

const ComposeRootHeader: React.FC = () => {
  const { composeState } = useContext(ComposeContext)

  return (
    <View>
      <ComposePostingAs />
      {composeState.spoiler.active ? <ComposeSpoilerInput /> : null}
      <ComposeTextInput />
    </View>
  )
}

export default ComposeRootHeader
