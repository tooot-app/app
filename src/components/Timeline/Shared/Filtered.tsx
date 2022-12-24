import CustomText from '@components/Text'
import removeHTML from '@helpers/removeHTML'
import { store } from '@root/store'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import { getInstance } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View } from 'react-native'

export interface FilteredProps {
  filterResults: { title: string; filter_action: Mastodon.Filter<'v2'>['filter_action'] }[]
}

const TimelineFiltered: React.FC<FilteredProps> = ({ filterResults }) => {
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'componentTimeline'])

  const main = () => {
    if (!filterResults?.length) {
      return <></>
    }
    switch (typeof filterResults[0]) {
      case 'string': // v1 filter
        return (
          <>
            {t('componentTimeline:shared.filtered.match', {
              defaultValue: 'v1',
              context: 'v1',
              phrase: filterResults[0]
            })}
          </>
        )
      default:
        return (
          <>
            {t('componentTimeline:shared.filtered.match', {
              defaultValue: 'v2',
              context: 'v2',
              count: filterResults.length,
              filters: filterResults.map(result => result.title).join(t('common:separator'))
            })}
            <CustomText
              style={{ color: colors.blue }}
              children={`\n${t('componentTimeline:shared.filtered.reveal')}`}
            />
          </>
        )
    }
  }

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
        {main()}
      </CustomText>
    </View>
  )
}

export const shouldFilter = ({
  queryKey,
  status
}: {
  queryKey: QueryKeyTimeline
  status: Pick<Mastodon.Status, 'content' | 'spoiler_text'>
}): FilteredProps['filterResults'] | undefined => {
  const page = queryKey[1]
  const instance = getInstance(store.getState())

  let returnFilter: FilteredProps['filterResults'] | undefined

  const rawContentCombined = [
    removeHTML(status.content),
    status.spoiler_text ? removeHTML(status.spoiler_text) : ''
  ]
    .filter(c => c.length)
    .join(`\n`)
  const checkFilter = (filter: Mastodon.Filter<'v1'>) => {
    const escapedPhrase = filter.phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& means the whole matched string
    switch (filter.whole_word) {
      case true:
        if (new RegExp(`\\b${escapedPhrase}\\b`, 'i').test(rawContentCombined)) {
          returnFilter = [{ title: filter.phrase, filter_action: 'warn' }]
        }
        break
      case false:
        if (new RegExp(escapedPhrase, 'i').test(rawContentCombined)) {
          returnFilter = [{ title: filter.phrase, filter_action: 'warn' }]
        }
        break
    }
  }
  instance?.filters?.forEach(filter => {
    if (returnFilter) {
      return
    }
    if (filter.expires_at) {
      if (new Date().getTime() > new Date(filter.expires_at).getTime()) {
        return
      }
    }

    switch (page.page) {
      case 'Following':
      case 'Local':
      case 'List':
      case 'Account':
        if (filter.context.includes('home')) {
          checkFilter(filter as Mastodon.Filter<'v1'>)
        }
        break
      case 'Notifications':
        if (filter.context.includes('notifications')) {
          checkFilter(filter as Mastodon.Filter<'v1'>)
        }
        break
      case 'LocalPublic':
        if (filter.context.includes('public')) {
          checkFilter(filter as Mastodon.Filter<'v1'>)
        }
        break
      case 'Toot':
        if (filter.context.includes('thread')) {
          checkFilter(filter as Mastodon.Filter<'v1'>)
        }
    }
  })

  return returnFilter
}

export default TimelineFiltered
