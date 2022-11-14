import CustomText from '@components/Text'
import { store } from '@root/store'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getInstance, getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import htmlparser2 from 'htmlparser2-without-node-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

const TimelineFiltered = React.memo(
  ({ phrase }: { phrase: string }) => {
    const { colors } = useTheme()
    const { t } = useTranslation('componentTimeline')

    return (
      <View style={{ backgroundColor: colors.backgroundDefault }}>
        <CustomText
          fontStyle='S'
          style={{
            color: colors.secondary,
            textAlign: 'center',
            paddingVertical: StyleConstants.Spacing.S,
            paddingLeft: StyleConstants.Avatar.M + StyleConstants.Spacing.S
          }}
        >
          {t('shared.filtered', { phrase })}
        </CustomText>
      </View>
    )
  },
  () => true
)

export const shouldFilter = ({
  copiableContent,
  status,
  queryKey
}: {
  copiableContent: React.MutableRefObject<{
    content: string
    complete: boolean
  }>
  status: Mastodon.Status
  queryKey: QueryKeyTimeline
}): string | null => {
  const instance = getInstance(store.getState())
  const ownAccount = getInstanceAccount(store.getState())?.id === status.account?.id

  let shouldFilter: string | null = null
  if (!ownAccount) {
    const parser = new htmlparser2.Parser({
      ontext: (text: string) => {
        if (!copiableContent.current.complete) {
          copiableContent.current.content = copiableContent.current.content + text
        }

        const checkFilter = (filter: Mastodon.Filter) => {
          const escapedPhrase = filter.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
          switch (filter.whole_word) {
            case true:
              if (new RegExp('\\b' + escapedPhrase + '\\b').test(text)) {
                shouldFilter = filter.phrase
              }
              break
            case false:
              if (new RegExp(escapedPhrase).test(text)) {
                shouldFilter = filter.phrase
              }
              break
          }
        }
        instance?.filters?.forEach(filter => {
          if (filter.expires_at) {
            if (new Date().getTime() > new Date(filter.expires_at).getTime()) {
              return
            }
          }

          switch (queryKey[1].page) {
            case 'Following':
            case 'Local':
            case 'List':
            case 'Account_Default':
              if (filter.context.includes('home')) {
                checkFilter(filter)
              }
              break
            case 'Notifications':
              if (filter.context.includes('notifications')) {
                checkFilter(filter)
              }
              break
            case 'LocalPublic':
              if (filter.context.includes('public')) {
                checkFilter(filter)
              }
              break
            case 'Toot':
              if (filter.context.includes('thread')) {
                checkFilter(filter)
              }
          }
        })
      }
    })
    status.spoiler_text && parser.write(status.spoiler_text)
    parser.write(status.content)
    parser.end()
    copiableContent.current.complete = true
  }

  return shouldFilter
}

export default TimelineFiltered
