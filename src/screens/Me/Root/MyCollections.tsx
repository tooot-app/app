import React from 'react'
import { MenuContainer, MenuHeader, MenuItem } from 'src/components/Menu'

export interface Props {
  id: Mastodon.Account['id']
}

const MyInfo: React.FC<Props> = ({ id }) => {
  return (
    <MenuContainer>
      <MenuHeader heading='我的东西' />
      <MenuItem icon='mail' title='私信' navigateTo='Screen-Me-Conversations' />
      <MenuItem icon='bookmark' title='书签' navigateTo='Screen-Me-Bookmarks' />
      <MenuItem icon='star' title='喜欢' navigateTo='Screen-Me-Favourites' />
      <MenuItem icon='list' title='列表' navigateTo='Screen-Me-Lists' />
    </MenuContainer>
  )
}

export default MyInfo
