import { store } from '@root/store'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getInstance, getInstanceAccount } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import htmlparser2 from 'htmlparser2-without-node-native'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'

const TimelineFiltered = React.memo(
  () => {
    const { colors } = useTheme()
    const { t } = useTranslation('componentTimeline')

    return (
      <View style={{ backgroundColor: colors.backgroundDefault }}>
        <Text
          style={{
            ...StyleConstants.FontStyle.S,
            color: colors.secondary,
            textAlign: 'center',
            paddingVertical: StyleConstants.Spacing.S,
            paddingLeft: StyleConstants.Avatar.M + StyleConstants.Spacing.S
          }}
        >
          {t('shared.filtered')}
        </Text>
      </View>
    )
  },
  () => true
)

export const shouldFilter = ({
  status,
  queryKey
}: {
  status: Mastodon.Status
  queryKey: QueryKeyTimeline
}) => {
  const instance = getInstance(store.getState())
  const ownAccount =
    getInstanceAccount(store.getState())?.id === status.account.id

  let shouldFilter = false
  if (!ownAccount) {
    const parser = new htmlparser2.Parser({
      ontext: (text: string) => {
        const checkFilter = (filter: Mastodon.Filter) => {
          const escapedPhrase = filter.phrase.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
          ) // $& means the whole matched string
          switch (filter.whole_word) {
            case true:
              if (new RegExp('\\B' + escapedPhrase + '\\B').test(text)) {
                shouldFilter = true
              }
              break
            case false:
              if (new RegExp(escapedPhrase).test(text)) {
                shouldFilter = true
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
    parser.write(status.content)
    parser.end()
  }

  return shouldFilter
}

export default TimelineFiltered
