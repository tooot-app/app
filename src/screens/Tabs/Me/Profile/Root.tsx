import { MenuContainer, MenuRow } from '@components/Menu'
import { TabMeProfileStackScreenProps } from '@utils/navigation/navigators'
import { useProfileMutation, useProfileQuery } from '@utils/queryHooks/profile'
import React, { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import FlashMessage from 'react-native-flash-message'
import { ScrollView } from 'react-native-gesture-handler'
import ProfileAvatarHeader from './Root/AvatarHeader'

const TabMeProfileRoot: React.FC<
  TabMeProfileStackScreenProps<'Tab-Me-Profile-Root'> & {
    messageRef: RefObject<FlashMessage>
  }
> = ({ messageRef, navigation }) => {
  const { t } = useTranslation(['common', 'screenTabs'])

  const { data, isFetching } = useProfileQuery()
  const { mutateAsync } = useProfileMutation()

  return (
    <ScrollView>
      <MenuContainer>
        <MenuRow
          title={t('screenTabs:me.profile.root.name.title')}
          content={data?.display_name}
          loading={isFetching}
          iconBack='ChevronRight'
          onPress={() => {
            data &&
              navigation.navigate('Tab-Me-Profile-Name', {
                display_name: data.display_name
              })
          }}
        />
        <ProfileAvatarHeader type='avatar' messageRef={messageRef} />
        <ProfileAvatarHeader type='header' messageRef={messageRef} />
        <MenuRow
          title={t('screenTabs:me.profile.root.note.title')}
          content={data?.source?.note}
          loading={isFetching}
          iconBack='ChevronRight'
          onPress={() => {
            data &&
              navigation.navigate('Tab-Me-Profile-Note', {
                note: data.source?.note
              })
          }}
        />
        <MenuRow
          title={t('screenTabs:me.profile.root.fields.title')}
          content={
            data?.source.fields && data.source.fields.length
              ? t('screenTabs:me.profile.root.fields.total', {
                  count: data.source.fields.length
                })
              : undefined
          }
          loading={isFetching}
          iconBack='ChevronRight'
          onPress={() => {
            navigation.navigate('Tab-Me-Profile-Fields', {
              fields: data?.source.fields
            })
          }}
        />
      </MenuContainer>
      <MenuContainer>
        <MenuRow
          title={t('screenTabs:me.profile.root.lock.title')}
          description={t('screenTabs:me.profile.root.lock.description')}
          switchValue={data?.locked}
          switchOnValueChange={() =>
            mutateAsync({
              messageRef,
              message: {
                text: 'me.profile.root.lock.title',
                succeed: false,
                failed: true
              },
              type: 'locked',
              data: data?.locked === undefined ? true : !data.locked
            })
          }
          loading={isFetching}
        />
        <MenuRow
          title={t('screenTabs:me.profile.root.bot.title')}
          description={t('screenTabs:me.profile.root.bot.description')}
          switchValue={data?.bot}
          switchOnValueChange={() =>
            mutateAsync({
              messageRef,
              message: {
                text: 'me.profile.root.bot.title',
                succeed: false,
                failed: true
              },
              type: 'bot',
              data: data?.bot === undefined ? true : !data.bot
            })
          }
          loading={isFetching}
        />
      </MenuContainer>
    </ScrollView>
  )
}

export default TabMeProfileRoot
