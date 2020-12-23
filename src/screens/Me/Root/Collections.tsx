import { useNavigation } from '@react-navigation/native'
import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { MenuContainer, MenuRow } from '@components/Menu'
import { useQuery } from 'react-query'
import { announcementFetch } from '@root/utils/fetches/announcementsFetch'

const Collections: React.FC = () => {
  const { t } = useTranslation('meRoot')
  const navigation = useNavigation()

  const queryKey = ['Announcements', { showAll: true }]
  const { data } = useQuery(queryKey, announcementFetch)

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
        iconFront='mail'
        iconBack='chevron-right'
        title={t('content.collections.conversations')}
        onPress={() => navigation.navigate('Screen-Me-Conversations')}
      />
      <MenuRow
        iconFront='bookmark'
        iconBack='chevron-right'
        title={t('content.collections.bookmarks')}
        onPress={() => navigation.navigate('Screen-Me-Bookmarks')}
      />
      <MenuRow
        iconFront='star'
        iconBack='chevron-right'
        title={t('content.collections.favourites')}
        onPress={() => navigation.navigate('Screen-Me-Favourites')}
      />
      <MenuRow
        iconFront='list'
        iconBack='chevron-right'
        title={t('content.collections.lists')}
        onPress={() => navigation.navigate('Screen-Me-Lists')}
      />
      <MenuRow
        iconFront='clipboard'
        iconBack='chevron-right'
        title={t('content.collections.announcements')}
        content={announcementContent}
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
