import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import React from 'react'
import { useTranslation } from 'react-i18next'

const Settings: React.FC = () => {
  const { t } = useTranslation('meRoot')
  const navigation = useNavigation()

  const [loadingState, setLoadingState] = React.useState(false)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingState(!loadingState)
    }, 5000)
    return () => clearTimeout(timer)
  }, [loadingState])

  return (
    <MenuContainer>
      <MenuRow
        iconFront='Settings'
        iconBack='ChevronRight'
        title={t('content.settings')}
        onPress={() => navigation.navigate('Screen-Me-Settings')}
      />
    </MenuContainer>
  )
}

export default Settings
