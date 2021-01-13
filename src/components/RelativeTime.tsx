import React from 'react'
import { useTranslation } from 'react-i18next'
import { Text } from 'react-native'
import TimeAgo from 'react-timeago'
// @ts-ignore
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter'

import zh from '@root/i18n/zh/components/relativeTime'
import en from '@root/i18n/en/components/relativeTime'

export interface Props {
  date: string
}

const RelativeTime: React.FC<Props> = ({ date }) => {
  const { i18n } = useTranslation()
  const mapLanguageToTranslation: { [key: string]: Object } = {
    'zh-CN': zh,
    'en-US': en
  }
  const formatter = buildFormatter(mapLanguageToTranslation[i18n.language])

  return <TimeAgo date={date} formatter={formatter} component={Text} />
}

export default RelativeTime
