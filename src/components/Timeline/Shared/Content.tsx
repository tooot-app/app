import { ParseHTML } from '@components/Parse'
import CustomText from '@components/Text'
import { getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform } from 'react-native'
import { useSelector } from 'react-redux'
import { isRtlLang } from 'rtl-detect'
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
  const instanceAccount = useSelector(getInstanceAccount, () => true)

  return (
    <>
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
            textStyles={
              Platform.OS === 'ios' && status.language && isRtlLang(status.language)
                ? { writingDirection: 'rtl' }
                : undefined
            }
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
              instanceAccount.preferences?.['reading:expand:spoilers'] || inThread
                ? notificationOwnToot
                  ? 2
                  : 999
                : 1
            }
            expandHint={t('shared.content.expandHint')}
            setSpoilerExpanded={setSpoilerExpanded}
            highlighted={highlighted}
            disableDetails={disableDetails}
            textStyles={
              Platform.OS === 'ios' && status.language && isRtlLang(status.language)
                ? { writingDirection: 'rtl' }
                : undefined
            }
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
          textStyles={
            Platform.OS === 'ios' && status.language && isRtlLang(status.language)
              ? { writingDirection: 'rtl' }
              : undefined
          }
        />
      )}
    </>
  )
}

export default TimelineContent
