import Button from '@components/Button'
import { MenuContainer, MenuRow } from '@components/Menu'
import { displayMessage } from '@components/Message'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { useNavigation } from '@react-navigation/native'
import { androidActionSheetStyles } from '@utils/helpers/androidActionSheetStyles'
import { urlMatcher } from '@utils/helpers/urlMatcher'
import { storage } from '@utils/storage'
import { getGlobalStorage, useGlobalStorage } from '@utils/storage/actions'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { Alert } from 'react-native'
import { MMKV } from 'react-native-mmkv'

const SettingsDev: React.FC = () => {
  const navigation = useNavigation()
  const { colors } = useTheme()
  const { showActionSheetWithOptions } = useActionSheet()

  const [accounts] = useGlobalStorage.object('accounts')
  const [account] = useGlobalStorage.string('account.active')

  return (
    <MenuContainer>
      <MenuRow title='Active account' content={account || '-'} onPress={() => {}} />
      <MenuRow
        title={'Saved local instances'}
        content={accounts?.length.toString()}
        iconBack='ChevronRight'
        onPress={() =>
          showActionSheetWithOptions(
            {
              options: (accounts || []).concat(['Cancel']),
              cancelButtonIndex: accounts?.length,
              ...androidActionSheetStyles(colors)
            },
            () => {}
          )
        }
      />
      <Button
        type='text'
        content={'Test link matcher'}
        style={{
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2,
          marginBottom: StyleConstants.Spacing.Global.PagePadding
        }}
        onPress={() =>
          Alert.prompt('URL', undefined, text => console.log(urlMatcher(text)), 'plain-text')
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
        content={'Purge MMKV'}
        style={{
          marginHorizontal: StyleConstants.Spacing.Global.PagePadding * 2,
          marginBottom: StyleConstants.Spacing.Global.PagePadding
        }}
        destructive
        onPress={() => {
          const accounts = getGlobalStorage.object('accounts')
          storage.account = undefined
          if (accounts) {
            for (const account of accounts) {
              console.log('Clearing', account)
              const temp = new MMKV({ id: account })
              temp.clearAll()
            }
          }
          console.log('Clearing', 'global')
          storage.global.clearAll()
          navigation.goBack()
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
