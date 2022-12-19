import Button from '@components/Button'
import { MenuContainer, MenuRow } from '@components/Menu'
import { displayMessage } from '@components/Message'
import CustomText from '@components/Text'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { androidActionSheetStyles } from '@helpers/androidActionSheetStyles'
import { persistor } from '@root/store'
import { getInstanceActive, getInstances } from '@utils/slices/instancesSlice'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import * as Localization from 'expo-localization'
import React from 'react'
import { DevSettings } from 'react-native'
import { useSelector } from 'react-redux'

const SettingsDev: React.FC = () => {
  const { colors } = useTheme()
  const { showActionSheetWithOptions } = useActionSheet()
  const instanceActive = useSelector(getInstanceActive)
  const instances = useSelector(getInstances, () => true)

  return (
    <MenuContainer>
      <CustomText
        fontStyle='S'
        selectable
        style={{
          paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
          color: colors.primaryDefault
        }}
      >
        {JSON.stringify(Localization.locales)}
      </CustomText>
      <CustomText
        fontStyle='S'
        selectable
        style={{
          paddingHorizontal: StyleConstants.Spacing.Global.PagePadding,
          color: colors.primaryDefault
        }}
      >
        {instances[instanceActive]?.token}
      </CustomText>
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
              cancelButtonIndex: instances.length,
              ...androidActionSheetStyles(colors)
            },
            () => {}
          )
        }
      />
      <Button
        type='text'
        content={'Test flash message'}
        style={{
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2,
          marginBottom: StyleConstants.Spacing.Global.PagePadding
        }}
        onPress={() => displayMessage({ message: 'This is a testing message' })}
      />
      <Button
        type='text'
        content={'Purge secure storage'}
        style={{
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2,
          marginBottom: StyleConstants.Spacing.Global.PagePadding
        }}
        destructive
        onPress={() => {
          persistor.purge().then(() => DevSettings.reload())
        }}
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
