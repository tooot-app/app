import ComponentAccount from '@components/Account'
import haptics from '@components/haptics'
import ComponentHashtag from '@components/Hashtag'
import Icon from '@components/Icon'
import ComponentSeparator from '@components/Separator'
import { useSearchQuery } from '@utils/queryHooks/search'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Fragment, useContext, useEffect } from 'react'
import { View } from 'react-native'
import { Circle } from 'react-native-animated-spinkit'
import ComposeContext from '../utils/createContext'
import { formatText } from '../utils/processText'

const ComposeRootSuggestions: React.FC = () => {
  const { composeState, composeDispatch } = useContext(ComposeContext)

  const { colors } = useTheme()

  useEffect(() => {
    if (composeState.text.raw.length === 0) {
      composeDispatch({ type: 'tag', payload: undefined })
    }
  }, [composeState.text.raw.length])

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
    limit: 10,
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

  const onPress = (content: string) => {
    const focusedInput = composeState.textInputFocus.current
    const updatedText = (): string => {
      const textInput = composeState.textInputFocus.current
      if (composeState.tag) {
        const contentFront = composeState[textInput].raw.slice(0, composeState.tag.index)
        const contentRear = composeState[textInput].raw.slice(composeState.tag.lastIndex)

        const spaceFront =
          contentFront.length === 0 ||
          composeState[textInput].raw.length === 0 ||
          /\s/g.test(contentFront.slice(-1))
            ? ''
            : ' '
        const spaceRear = /\s/g.test(contentRear[0]) ? '' : ' '

        return [contentFront, spaceFront, content, spaceRear, contentRear].join('')
      } else {
        return composeState[textInput].raw
      }
    }
    formatText({
      textInput: focusedInput,
      composeDispatch,
      content: updatedText(),
      disableDebounce: true
    })
    haptics('Light')
  }

  const main = () => {
    if (composeState.tag) {
      switch (composeState.tag?.schema) {
        case '@':
          return (
            <View>
              {data?.accounts?.map(account => (
                <Fragment key={account.id}>
                  <ComponentAccount
                    account={account}
                    props={{ onPress: () => onPress(`@${account.acct}`) }}
                    children={
                      <Icon
                        name='Plus'
                        size={StyleConstants.Font.Size.L}
                        color={colors.secondary}
                        style={{ marginLeft: 8 }}
                      />
                    }
                  />
                  <ComponentSeparator />
                </Fragment>
              ))}
            </View>
          )
        case '#':
          return (
            <View>
              {data?.hashtags?.map(hashtag => (
                <Fragment key={hashtag.name}>
                  <ComponentHashtag hashtag={hashtag} onPress={() => onPress(`#${hashtag.name}`)} />
                  <ComponentSeparator />
                </Fragment>
              ))}
            </View>
          )
      }
    }
  }

  return isFetching ? (
    <View
      key='listEmpty'
      style={{ flex: 1, alignItems: 'center', marginVertical: StyleConstants.Spacing.M }}
    >
      <Circle size={StyleConstants.Font.Size.M * 1.25} color={colors.secondary} />
    </View>
  ) : (
    <>{main()}</>
  )
}

export default ComposeRootSuggestions
