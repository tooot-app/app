import { ParseHTML } from '@components/Parse'
import CustomText from '@components/Text'
import { usePreferencesQuery } from '@utils/queryHooks/preferences'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'
import StatusContext from './Context'

export interface Props {
  notificationOwnToot?: boolean
  setSpoilerExpanded?: React.Dispatch<React.SetStateAction<boolean>>
}

const TimelineContent: React.FC<Props> = ({ notificationOwnToot = false, setSpoilerExpanded }) => {
  const { status, highlighted, inThread } = useContext(StatusContext)
  if (!status || typeof status.content !== 'string' || !status.content.length) return null

  const { colors } = useTheme()
  const { t } = useTranslation('componentTimeline')

  const { data: preferences } = usePreferencesQuery()

  return (
    <View>
      {status.spoiler_text?.length ? (
        <>
          <ParseHTML
            content={status.spoiler_text}
            size={highlighted ? 'L' : 'M'}
            adaptiveSize
            numberOfLines={999}
          />
          {inThread ? (
            <CustomText
              fontStyle='S'
              style={{
                textAlign: 'center',
                color: colors.secondary,
                paddingVertical: StyleConstants.Spacing.XS
              }}
            >
              {t('shared.content.expandHint')}
            </CustomText>
          ) : null}
          <ParseHTML
            content={status.content}
            size={highlighted ? 'L' : 'M'}
            adaptiveSize
            numberOfLines={
              preferences?.['reading:expand:spoilers'] || inThread
                ? notificationOwnToot
                  ? 2
                  : 999
                : 1
            }
            expandHint={t('shared.content.expandHint')}
            setSpoilerExpanded={setSpoilerExpanded}
          />
        </>
      ) : (
        <ParseHTML
          content={status.content}
          size={highlighted ? 'L' : 'M'}
          adaptiveSize
          numberOfLines={highlighted || inThread ? 999 : notificationOwnToot ? 2 : undefined}
        />
      )}
    </View>
  )
}

export default TimelineContent
