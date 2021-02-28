import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { useAnnouncementQuery } from '@utils/queryHooks/announcement'
import { useListsQuery } from '@utils/queryHooks/lists'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const Collections: React.FC = () => {
  const { t, i18n } = useTranslation('meRoot')
  const navigation = useNavigation()

  const listsQuery = useListsQuery({
    options: {
      notifyOnChangeProps: []
    }
  })
  const rowLists = useMemo(() => {
    if (listsQuery.isSuccess && listsQuery.data?.length) {
      return (
        <MenuRow
          iconFront='List'
          iconBack='ChevronRight'
          title={t('content.collections.lists')}
          onPress={() => navigation.navigate('Tab-Me-Lists')}
        />
      )
    }
  }, [listsQuery.isSuccess, listsQuery.data, i18n.language])

  const announcementsQuery = useAnnouncementQuery({
    showAll: true,
    options: {
      notifyOnChangeProps: []
    }
  })
  const rowAnnouncements = useMemo(() => {
    if (announcementsQuery.isSuccess && announcementsQuery.data?.length) {
      const amount = announcementsQuery.data.filter(
        announcement => !announcement.read
      ).length
      return (
        <MenuRow
          iconFront='Clipboard'
          iconBack='ChevronRight'
          title={t('content.collections.announcements.heading')}
          content={
            amount
              ? t('content.collections.announcements.content.unread', {
                  amount
                })
              : t('content.collections.announcements.content.read')
          }
          onPress={() =>
            navigation.navigate('Screen-Announcements', { showAll: true })
          }
        />
      )
    }
  }, [announcementsQuery.isSuccess, announcementsQuery.data, i18n.language])

  return (
    <MenuContainer>
      <MenuRow
        iconFront='Mail'
        iconBack='ChevronRight'
        title={t('content.collections.conversations')}
        onPress={() => navigation.navigate('Tab-Me-Conversations')}
      />
      <MenuRow
        iconFront='Bookmark'
        iconBack='ChevronRight'
        title={t('content.collections.bookmarks')}
        onPress={() => navigation.navigate('Tab-Me-Bookmarks')}
      />
      <MenuRow
        iconFront='Heart'
        iconBack='ChevronRight'
        title={t('content.collections.favourites')}
        onPress={() => navigation.navigate('Tab-Me-Favourites')}
      />
      {rowLists}
      {rowAnnouncements}
    </MenuContainer>
  )
}

export default Collections
