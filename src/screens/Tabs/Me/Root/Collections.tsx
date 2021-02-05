import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { useAnnouncementQuery } from '@utils/queryHooks/announcement'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

const Collections: React.FC = () => {
  const { t, i18n } = useTranslation('meRoot')
  const navigation = useNavigation()

  const { data, isFetching } = useAnnouncementQuery({
    showAll: true
  })

  const announcementContent = useMemo(() => {
    if (data) {
      if (data.length === 0) {
        return t('content.collections.announcements.content.empty')
      } else {
        const amount = data.filter(announcement => !announcement.read).length
        if (amount) {
          return t('content.collections.announcements.content.unread', {
            amount
          })
        } else {
          return t('content.collections.announcements.content.read')
        }
      }
    }
  }, [data, i18n.language])

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
        iconFront='Star'
        iconBack='ChevronRight'
        title={t('content.collections.favourites')}
        onPress={() => navigation.navigate('Tab-Me-Favourites')}
      />
      <MenuRow
        iconFront='List'
        iconBack='ChevronRight'
        title={t('content.collections.lists')}
        onPress={() => navigation.navigate('Tab-Me-Lists')}
      />
      <MenuRow
        iconFront='Clipboard'
        iconBack={data && data.length === 0 ? undefined : 'ChevronRight'}
        title={t('content.collections.announcements.heading')}
        content={announcementContent}
        loading={isFetching}
        onPress={() =>
          data &&
          data.length &&
          navigation.navigate('Screen-Announcements', { showAll: true })
        }
      />
    </MenuContainer>
  )
}

export default Collections
