import React, { useContext } from 'react'
import ComposeSpoilerInput from '@screens/Shared/Compose/SpoilerInput'
import ComposeTextInput from '@screens/Shared/Compose/TextInput'
import ComposeContext from '@screens/Shared/Compose//utils/createContext'

const ComposeRootHeader: React.FC = () => {
  const { composeState } = useContext(ComposeContext)

  return (
    <>
      {composeState.spoiler.active ? <ComposeSpoilerInput /> : null}
      <ComposeTextInput />
    </>
  )
}

export default ComposeRootHeader
