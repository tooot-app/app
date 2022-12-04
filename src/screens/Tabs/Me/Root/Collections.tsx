import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '@root/store'
import { useAnnouncementQuery } from '@utils/queryHooks/announcement'
import { useListsQuery } from '@utils/queryHooks/lists'
import {
  getInstanceMePage,
  updateInstanceMePage
} from '@utils/slices/instancesSlice'
import { getInstancePush } from '@utils/slices/instancesSlice'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const Collections: React.FC = () => {
  const { t } = useTranslation('screenTabs')
  const navigation = useNavigation<any>()

  const dispatch = useAppDispatch()
  const mePage = useSelector(getInstanceMePage)

  const listsQuery = useListsQuery({
    options: {
      notifyOnChangeProps: ['data']
    }
  })
  useEffect(() => {
    if (listsQuery.isSuccess) {
      dispatch(
        updateInstanceMePage({
          lists: { shown: listsQuery.data?.length ? true : false }
        })
      )
    }
  }, [listsQuery.isSuccess, listsQuery.data?.length])

  const announcementsQuery = useAnnouncementQuery({
    showAll: true,
    options: {
      notifyOnChangeProps: ['data']
    }
  })
  useEffect(() => {
    if (announcementsQuery.isSuccess) {
      dispatch(
        updateInstanceMePage({
          announcements: {
            shown: announcementsQuery.data?.length ? true : false,
            unread: announcementsQuery.data?.filter(
              announcement => !announcement.read
            ).length
          }
        })
      )
    }
  }, [announcementsQuery.isSuccess, announcementsQuery.data?.length])

  const instancePush = useSelector(
    getInstancePush,
    (prev, next) => prev?.global.value === next?.global.value
  )

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
      {mePage.lists.shown ? (
        <MenuRow
          iconFront='List'
          iconBack='ChevronRight'
          title={t('me.stacks.lists.name')}
          onPress={() => navigation.navigate('Tab-Me-List-List')}
        />
      ) : null}
      {mePage.announcements.shown ? (
        <MenuRow
          iconFront='Clipboard'
          iconBack='ChevronRight'
          title={t('screenAnnouncements:heading')}
          content={
            mePage.announcements.unread
              ? t('me.root.announcements.content.unread', {
                  amount: mePage.announcements.unread
                })
              : t('me.root.announcements.content.read')
          }
          onPress={() =>
            navigation.navigate('Screen-Announcements', { showAll: true })
          }
        />
      ) : null}
      <MenuRow
        iconFront={instancePush ? 'Bell' : 'BellOff'}
        iconBack='ChevronRight'
        title={t('me.stacks.push.name')}
        content={
          instancePush.global.value
            ? t('me.root.push.content.enabled')
            : t('me.root.push.content.disabled')
        }
        onPress={() => navigation.navigate('Tab-Me-Push')}
      />
    </MenuContainer>
  )
}

export default Collections
