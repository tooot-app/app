import React from 'react'

import { useDispatch } from 'react-redux'
import { updateLocal } from 'src/utils/slices/instancesSlice'
import MenuButton from 'src/components/Menu/Button'
import { MenuContainer } from 'src/components/Menu'
import { useNavigation } from '@react-navigation/native'

const Logout: React.FC = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()

  const alertOption = {
    title: '确认退出登录？',
    message: '退出登录后，需要重新认证账号',
    buttons: [
      {
        text: '退出登录',
        style: 'destructive' as const,
        onPress: () => {
          dispatch(updateLocal({}))
          navigation.navigate('Screen-Public', {
            screen: 'Screen-Public-Root',
            params: { publicTab: true }
          })
        }
      },
      {
        text: '取消',
        style: 'cancel' as const
      }
    ]
  }

  return (
    <MenuContainer>
      <MenuButton
        text='退出当前账号'
        destructive={true}
        alertOption={alertOption}
      />
    </MenuContainer>
  )
}

export default Logout
