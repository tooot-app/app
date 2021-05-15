import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { useAnnouncementQuery } from '@utils/queryHooks/announcement'
import { useListsQuery } from '@utils/queryHooks/lists'
import React from 'react'
import { useTranslation } from 'react-i18next'

const Collections: React.FC = () => {
  const { t } = useTranslation('screenTabs')
  const navigation = useNavigation()

  const listsQuery = useListsQuery({
    options: {
      notifyOnChangeProps: ['data']
    }
  })

  const announcementsQuery = useAnnouncementQuery({
    showAll: true,
    options: {
      notifyOnChangeProps: ['data']
    }
  })

  return (
    <MenuContainer>
      <MenuRow
        iconFront='Mail'
        iconBack='ChevronRight'
        title={t('me.stacks.conversations.name')}
        onPress={() => navigation.navigate('Tab-Me-Conversations')}
      />
      <MenuRow
        iconFront='Bookmark'
        iconBack='ChevronRight'
        title={t('me.stacks.bookmarks.name')}
        onPress={() => navigation.navigate('Tab-Me-Bookmarks')}
      />
      <MenuRow
        iconFront='Heart'
        iconBack='ChevronRight'
        title={t('me.stacks.favourites.name')}
        onPress={() => navigation.navigate('Tab-Me-Favourites')}
      />
      {listsQuery.data?.length ? (
        <MenuRow
          iconFront='List'
          iconBack='ChevronRight'
          title={t('me.stacks.lists.name')}
          onPress={() => navigation.navigate('Tab-Me-Lists')}
        />
      ) : null}
      {announcementsQuery.data?.length ? (
        <MenuRow
          iconFront='Clipboard'
          iconBack='ChevronRight'
          title={t('screenAnnouncements:heading')}
          content={
            announcementsQuery.data.filter(announcement => !announcement.read)
              .length
              ? t('me.root.announcements.content.unread', {
                  amount: announcementsQuery.data.filter(
                    announcement => !announcement.read
                  ).length
                })
              : t('me.root.announcements.content.read')
          }
          onPress={() =>
            navigation.navigate('Screen-Announcements', { showAll: true })
          }
        />
      ) : null}
    </MenuContainer>
  )
}

export default Collections
