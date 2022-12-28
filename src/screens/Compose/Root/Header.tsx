import React, { useContext } from 'react'
import { View } from 'react-native'
import ComposePostingAs from './Header/PostingAs'
import ComposeSpoilerInput from './Header/SpoilerInput'
import ComposeTextInput from './Header/TextInput'
import ComposeContext from '../utils/createContext'

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
