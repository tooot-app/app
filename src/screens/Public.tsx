import React from 'react'
import { useTranslation } from 'react-i18next'

import Timelines from 'src/components/Timelines'

const ScreenPublic: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Timelines
      name='Screen-Public-Root'
      content={[
        { title: t('headers.public.segments.left'), page: 'LocalPublic' },
        { title: t('headers.public.segments.right'), page: 'RemotePublic' }
      ]}
    />
  )
}

export default ScreenPublic
