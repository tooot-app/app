import analytics from '@components/analytics'
import Button from '@components/Button'
import GracefullyImage from '@components/GracefullyImage'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { StyleConstants } from '@utils/styles/constants'
import React from 'react'
import { Pressable, StyleSheet, View } from 'react-native'

export interface Props {
  account: Mastodon.Account | undefined
  myInfo: boolean
  edit?: boolean
}

const AccountInformationAvatar: React.FC<Props> = ({
  account,
  myInfo,
  edit
}) => {
  const navigation = useNavigation<
    StackNavigationProp<Nav.TabLocalStackParamList>
  >()
  const { reduceMotionEnabled } = useAccessibility()

  return (
    <Pressable
      disabled={!myInfo}
      onPress={() => {
        analytics('account_avatar_press')
        myInfo && account && navigation.push('Tab-Shared-Account', { account })
      }}
      style={styles.base}
    >
      <GracefullyImage
        key={account?.avatar}
        style={styles.image}
        uri={{
          original: reduceMotionEnabled
            ? account?.avatar_static
            : account?.avatar
        }}
      />
      {edit ? (
        <View
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            alignContent: 'center',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Button type='icon' content='Edit' round onPress={() => {}} />
        </View>
      ) : null}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    overflow: 'hidden',
    width: StyleConstants.Avatar.L,
    height: StyleConstants.Avatar.L
  },
  image: { flex: 1 }
})

export default AccountInformationAvatar
