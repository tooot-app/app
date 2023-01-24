import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { useAnnouncementQuery } from '@utils/queryHooks/announcement'
import { useListsQuery } from '@utils/queryHooks/lists'
import { useFollowedTagsQuery } from '@utils/queryHooks/tags'
import { useAccountStorage } from '@utils/storage/actions'
import React from 'react'
import { useTranslation } from 'react-i18next'

const Collections: React.FC = () => {
  const { t } = useTranslation(['screenAnnouncements', 'screenTabs'])
  const navigation = useNavigation<any>()

  const [pageMe, setPageMe] = useAccountStorage.object('page_me')

  useListsQuery({
    options: {
      onSuccess: data => setPageMe({ ...pageMe, lists: { shown: !!data?.length } })
    }
  })
  useFollowedTagsQuery({
    options: {
      onSuccess: data =>
        setPageMe({ ...pageMe, followedTags: { shown: !!data.pages[0].body.length } })
    }
  })
  useAnnouncementQuery({
    showAll: true,
    options: {
      onSuccess: data =>
        setPageMe({
          ...pageMe,
          announcements: {
            shown: !!data?.length ? true : false,
            unread: data?.filter(announcement => !announcement.read).length
          }
        })
    }
  })

  const [instancePush] = useAccountStorage.object('push')

  return (
    <MenuContainer>
      <MenuRow
        iconFront='mail'
        iconBack='chevron-right'
        title={t('screenTabs:me.stacks.conversations.name')}
        onPress={() => navigation.navigate('Tab-Me-Conversations')}
      />
      <MenuRow
        iconFront='bookmark'
        iconBack='chevron-right'
        title={t('screenTabs:me.stacks.bookmarks.name')}
        onPress={() => navigation.navigate('Tab-Me-Bookmarks')}
      />
      <MenuRow
        iconFront='heart'
        iconBack='chevron-right'
        title={t('screenTabs:me.stacks.favourites.name')}
        onPress={() => navigation.navigate('Tab-Me-Favourites')}
      />
      {pageMe?.lists?.shown ? (
        <MenuRow
          iconFront='list'
          iconBack='chevron-right'
          title={t('screenTabs:me.stacks.lists.name')}
          onPress={() => navigation.navigate('Tab-Me-List-List')}
        />
      ) : null}
      {pageMe?.followedTags?.shown ? (
        <MenuRow
          iconFront='hash'
          iconBack='chevron-right'
          title={t('screenTabs:me.stacks.followedTags.name')}
          onPress={() => navigation.navigate('Tab-Me-FollowedTags')}
        />
      ) : null}
      {pageMe?.announcements?.shown ? (
        <MenuRow
          iconFront='clipboard'
          iconBack='chevron-right'
          title={t('screenAnnouncements:heading')}
          content={
            pageMe.announcements.unread
              ? t('screenTabs:me.root.announcements.content.unread', {
                  amount: pageMe.announcements.unread
                })
              : t('screenTabs:me.root.announcements.content.read')
          }
          onPress={() => navigation.navigate('Screen-Announcements', { showAll: true })}
        />
      ) : null}
      <MenuRow
        iconFront={instancePush ? 'bell' : 'bell-off'}
        iconBack='chevron-right'
        title={t('screenTabs:me.stacks.push.name')}
        content={
          typeof instancePush.global === 'boolean'
            ? t('screenTabs:me.root.push.content', {
                defaultValue: 'false',
                context: instancePush.global.toString()
              })
            : undefined
        }
        onPress={() => navigation.navigate('Tab-Me-Push')}
      />
    </MenuContainer>
  )
}

export default Collections
