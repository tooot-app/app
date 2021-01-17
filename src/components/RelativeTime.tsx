import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'
import TimeAgo from 'react-timeago'
// @ts-ignore
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'

export interface Props {
  date: string
}

const RelativeTime: React.FC<Props> = ({ date }) => {
  const { t } = useTranslation('relativeTime')

  return (
    <TimeAgo
      date={date}
      component={Text}
      formatter={buildFormatter(t('strings', { returnObjects: true }))}
    />
  )
}

export default RelativeTime
