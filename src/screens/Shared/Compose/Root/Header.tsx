import React, { useContext } from 'react'
import { ComposeContext } from '../../Compose'
import ComposeSpoilerInput from '../SpoilerInput'
import ComposeTextInput from '../TextInput'

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
