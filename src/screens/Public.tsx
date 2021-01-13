import Timelines from '@components/Timelines'
import React from 'react'
import { useTranslation } from 'react-i18next'

const ScreenPublic: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Timelines
      name='Public'
      content={[
        { title: t('public:heading.segments.left'), page: 'LocalPublic' },
        {
          title: t('public:heading.segments.right'),
          page: 'RemotePublic',
          remote: true
        }
      ]}
    />
  )
}

export default ScreenPublic
