import { MenuContainer, MenuRow } from '@components/Menu'
import { useActionSheet } from '@expo/react-native-action-sheet'
import { androidActionSheetStyles } from '@utils/helpers/androidActionSheetStyles'
import { TabMeProfileStackScreenProps } from '@utils/navigation/navigators'
import { queryClient } from '@utils/queryHooks'
import { QueryKeyPreferences } from '@utils/queryHooks/preferences'
import { useProfileMutation, useProfileQuery } from '@utils/queryHooks/profile'
import { useTheme } from '@utils/styles/ThemeManager'
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
  const { colors } = useTheme()
  const { t } = useTranslation(['common', 'screenTabs'])

  const { showActionSheetWithOptions } = useActionSheet()

  const { data, isFetching } = useProfileQuery()
  const { mutateAsync } = useProfileMutation()

  const refetchPreferences = () => {
    const queryKeyPreferences: QueryKeyPreferences = ['Preferences']
    queryClient.refetchQueries(queryKeyPreferences)
  }

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
          content={data?.source.note}
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
        {data?.source.privacy !== 'direct' ? (
          <MenuRow
            title={t('screenTabs:me.profile.root.visibility.title')}
            content={
              data?.source.privacy
                ? t(`screenTabs:me.profile.root.visibility.options.${data.source.privacy}`)
                : undefined
            }
            loading={isFetching}
            iconBack='ChevronRight'
            onPress={() =>
              showActionSheetWithOptions(
                {
                  title: t('screenTabs:me.profile.root.visibility.title'),
                  options: [
                    t('screenTabs:me.profile.root.visibility.options.public'),
                    t('screenTabs:me.profile.root.visibility.options.unlisted'),
                    t('screenTabs:me.profile.root.visibility.options.private'),
                    t('common:buttons.cancel')
                  ],
                  cancelButtonIndex: 3,
                  ...androidActionSheetStyles(colors)
                },
                async buttonIndex => {
                  switch (buttonIndex) {
                    case 0:
                    case 1:
                    case 2:
                      const indexVisibilityMapping = ['public', 'unlisted', 'private'] as [
                        'public',
                        'unlisted',
                        'private'
                      ]
                      if (data?.source.privacy !== indexVisibilityMapping[buttonIndex]) {
                        mutateAsync({
                          messageRef,
                          message: {
                            text: 'me.profile.root.visibility.title',
                            succeed: false,
                            failed: true
                          },
                          type: 'source[privacy]',
                          data: indexVisibilityMapping[buttonIndex]
                        }).then(() => refetchPreferences())
                      }
                      break
                  }
                }
              )
            }
          />
        ) : null}
        <MenuRow
          title={t('screenTabs:me.profile.root.sensitive.title')}
          switchValue={data?.source.sensitive}
          switchOnValueChange={() =>
            mutateAsync({
              messageRef,
              message: {
                text: 'me.profile.root.sensitive.title',
                succeed: false,
                failed: true
              },
              type: 'source[sensitive]',
              data: data?.source.sensitive === undefined ? true : !data.source.sensitive
            }).then(() => refetchPreferences())
          }
          loading={isFetching}
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
