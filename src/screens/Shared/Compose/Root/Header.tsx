import React, { useContext } from 'react'
import { ComposeContext } from '@screens/Shared/Compose'
import ComposeSpoilerInput from '@screens/Shared/Compose/SpoilerInput'
import ComposeTextInput from '@screens/Shared/Compose/TextInput'

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
