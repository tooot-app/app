import { useNavigation } from '@react-navigation/native'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { MenuContainer, MenuRow } from '@components/Menu'
import hookAnnouncement from '@utils/queryHooks/announcement'

const Collections: React.FC = () => {
  const { t } = useTranslation('meRoot')
  const navigation = useNavigation()

  const { data, isFetching } = hookAnnouncement({ showAll: true })

  const announcementContent = useMemo(() => {
    if (data) {
      const amount = data.filter(announcement => !announcement.read).length
      if (amount) {
        return `${amount} 条未读公告`
      } else {
        return '无未读公告'
      }
    }
  }, [data])

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
        title={t('content.collections.announcements')}
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
