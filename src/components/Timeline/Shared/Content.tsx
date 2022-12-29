import { ParseHTML } from '@components/Parse'
import CustomText from '@components/Text'
import { usePreferencesQuery } from '@utils/queryHooks/preferences'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import i18next from 'i18next'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, View } from 'react-native'
import StatusContext from './Context'

export interface Props {
  notificationOwnToot?: boolean
  setSpoilerExpanded?: React.Dispatch<React.SetStateAction<boolean>>
}

const TimelineContent: React.FC<Props> = ({ notificationOwnToot = false, setSpoilerExpanded }) => {
  const { status, highlighted, inThread, disableDetails } = useContext(StatusContext)
  if (!status || typeof status.content !== 'string' || !status.content.length) return null

  const { colors } = useTheme()
  const { t } = useTranslation('componentTimeline')

  const { data: preferences } = usePreferencesQuery()

  const isRTLiOSTextStyles =
    Platform.OS === 'ios' && status.language && i18next.dir(status.language) === 'rtl'
      ? ({ writingDirection: 'rtl' } as { writingDirection: 'rtl' })
      : undefined

  return (
    <View>
      {status.spoiler_text?.length ? (
        <>
          <ParseHTML
            content={status.spoiler_text}
            size={highlighted ? 'L' : 'M'}
            adaptiveSize
            emojis={status.emojis}
            mentions={status.mentions}
            tags={status.tags}
            numberOfLines={999}
            highlighted={highlighted}
            disableDetails={disableDetails}
            textStyles={isRTLiOSTextStyles}
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
            emojis={status.emojis}
            mentions={status.mentions}
            tags={status.tags}
            numberOfLines={
              preferences?.['reading:expand:spoilers'] || inThread
                ? notificationOwnToot
                  ? 2
                  : 999
                : 1
            }
            expandHint={t('shared.content.expandHint')}
            setSpoilerExpanded={setSpoilerExpanded}
            highlighted={highlighted}
            disableDetails={disableDetails}
            textStyles={isRTLiOSTextStyles}
          />
        </>
      ) : (
        <ParseHTML
          content={status.content}
          size={highlighted ? 'L' : 'M'}
          adaptiveSize
          emojis={status.emojis}
          mentions={status.mentions}
          tags={status.tags}
          numberOfLines={highlighted || inThread ? 999 : notificationOwnToot ? 2 : undefined}
          disableDetails={disableDetails}
          textStyles={isRTLiOSTextStyles}
        />
      )}
    </View>
  )
}

export default TimelineContent
