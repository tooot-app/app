import React from 'react'
import { useTranslation } from 'react-i18next'

import Timelines from '@components/Timelines'

const ScreenLocal: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Timelines
      name='Screen-Local-Root'
      content={[
        { title: t('local:heading.segments.left'), page: 'Following' },
        { title: t('local:heading.segments.right'), page: 'Local' }
      ]}
    />
  )
}

export default ScreenLocal
