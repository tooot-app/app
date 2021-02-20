import Button from '@components/Button'
import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { persistor } from '@root/store'
import { getInstanceActive, getInstances } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { useSelector } from 'react-redux'

const SettingsDev: React.FC = () => {
  const { showActionSheetWithOptions } = useActionSheet()
  const instanceActive = useSelector(getInstanceActive)
  const instances = useSelector(getInstances)

  return (
    <MenuContainer>
      <MenuRow
        title={'Local active index'}
        content={typeof instanceActive + ' - ' + instanceActive}
        onPress={() => {}}
      />
      <MenuRow
        title={'Saved local instances'}
        content={instances.length.toString()}
        iconBack='ChevronRight'
        onPress={() =>
          showActionSheetWithOptions(
            {
              options: instances
                .map(instance => {
                  return instance.url + ': ' + instance.account.id
                })
                .concat(['Cancel']),
              cancelButtonIndex: instances.length
            },
            buttonIndex => {}
          )
        }
      />
      <Button
        type='text'
        content={'Purge secure storage'}
        style={{
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2,
          marginBottom: StyleConstants.Spacing.Global.PagePadding * 2
        }}
        destructive
        onPress={() => persistor.purge()}
      />
      <Button
        type='text'
        content={'Crash test'}
        style={{
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2,
          marginBottom: StyleConstants.Spacing.Global.PagePadding * 2
        }}
        destructive
        onPress={() => {
          throw new Error('Testing crash')
        }}
      />
    </MenuContainer>
  )
}

export default SettingsDev
