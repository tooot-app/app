import React from 'react'
import { useTranslation } from 'react-i18next'

import Timelines from 'src/components/Timelines'

const ScreenLocal: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Timelines
      name='Screen-Local-Root'
      content={[
        { title: t('headers.local.segments.left'), page: 'Following' },
        { title: t('headers.local.segments.right'), page: 'Local' }
      ]}
    />
  )
}

export default ScreenLocal
