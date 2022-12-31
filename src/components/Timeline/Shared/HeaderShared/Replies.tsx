import CustomText from '@components/Text'
import { useNavigation } from '@react-navigation/native'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { Fragment, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import StatusContext from '../Context'

const HeaderSharedReplies: React.FC = () => {
  const { status, rawContent, excludeMentions, isConversation } = useContext(StatusContext)
  if (!isConversation) return null

  const navigation = useNavigation<any>()
  const { t } = useTranslation('componentTimeline')
  const { colors } = useTheme()

  const mentionsBeginning = rawContent?.current?.[0]
    .match(new RegExp(/^(?:@\S+\s+)+/))?.[0]
    ?.match(new RegExp(/@\S+/, 'g'))
  excludeMentions &&
    (excludeMentions.current =
      mentionsBeginning?.length && status?.mentions
        ? status.mentions.filter(mention => mentionsBeginning.includes(`@${mention.username}`))
        : [])

  return excludeMentions?.current.length ? (
    <CustomText
      fontStyle='S'
      style={{
        marginLeft: StyleConstants.Spacing.S,
        flexDirection: 'row',
        color: colors.secondary
      }}
    >
      Replies
      {excludeMentions.current.map((mention, index) => (
        <Fragment key={index}>
          {' '}
          <CustomText
            style={{ color: colors.blue, paddingLeft: StyleConstants.Spacing.S }}
            children={`@${mention.username}`}
            onPress={() => navigation.push('Tab-Shared-Account', { account: mention })}
          />
        </Fragment>
      ))}
    </CustomText>
  ) : null
}

export default HeaderSharedReplies
