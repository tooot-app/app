import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { useAnnouncementQuery } from '@utils/queryHooks/announcement'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const Collections: React.FC = () => {
  const { t, i18n } = useTranslation('meRoot')
  const navigation = useNavigation()

  const { data, isFetching } = useAnnouncementQuery({ showAll: true })

  const announcementContent = useMemo(() => {
    if (data) {
      const amount = data.filter(announcement => !announcement.read).length
      if (amount) {
        return t('content.collections.announcements.content.unread', { amount })
      } else {
        return t('content.collections.announcements.content.read')
      }
    }
  }, [data, i18n.language])

  return (
    <MenuContainer>
      <MenuRow
        iconFront='Mail'
        iconBack='ChevronRight'
        title={t('content.collections.conversations')}
        onPress={() => navigation.navigate('Screen-Me-Conversations')}
      />
      <MenuRow
        iconFront='Bookmark'
        iconBack='ChevronRight'
        title={t('content.collections.bookmarks')}
        onPress={() => navigation.navigate('Screen-Me-Bookmarks')}
      />
      <MenuRow
        iconFront='Star'
        iconBack='ChevronRight'
        title={t('content.collections.favourites')}
        onPress={() => navigation.navigate('Screen-Me-Favourites')}
      />
      <MenuRow
        iconFront='List'
        iconBack='ChevronRight'
        title={t('content.collections.lists')}
        onPress={() => navigation.navigate('Screen-Me-Lists')}
      />
      <MenuRow
        iconFront='Clipboard'
        iconBack='ChevronRight'
        title={t('content.collections.announcements.heading')}
        content={announcementContent}
        loading={isFetching}
        onPress={() =>
          data &&
          data.length &&
          navigation.navigate('Screen-Shared-Announcements', { showAll: true })
        }
      />
    </MenuContainer>
  )
}

export default Collections
