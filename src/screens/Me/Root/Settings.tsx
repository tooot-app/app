import React from 'react'
import { MenuContainer, MenuHeader, MenuItem } from 'src/components/Menu'

const Settings: React.FC = () => {
  return (
    <MenuContainer>
      <MenuHeader heading='设置' />
      <MenuItem icon='settings' title='设置' navigateTo='Local' />
    </MenuContainer>
  )
}

export default Settings
