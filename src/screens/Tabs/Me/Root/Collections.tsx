import { MenuContainer, MenuRow } from '@components/Menu'
import { useNavigation } from '@react-navigation/native'
import { useAppDispatch } from '@root/store'
import { useAnnouncementQuery } from '@utils/queryHooks/announcement'
import { useListsQuery } from '@utils/queryHooks/lists'
import { useFollowedTagsQuery } from '@utils/queryHooks/tags'
import { getInstanceMePage, updateInstanceMePage } from '@utils/slices/instancesSlice'
import { getInstancePush } from '@utils/slices/instancesSlice'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

const Collections: React.FC = () => {
  const { t } = useTranslation('screenTabs')
  const navigation = useNavigation<any>()

  const dispatch = useAppDispatch()
  const mePage = useSelector(getInstanceMePage)

  useFollowedTagsQuery({
    options: {
      onSuccess: data =>
        dispatch(
          updateInstanceMePage({
            followedTags: { shown: !!data?.pages?.[0].body?.length }
          })
        )
    }
  })
  useListsQuery({
    options: {
      onSuccess: data =>
        dispatch(
          updateInstanceMePage({
            lists: { shown: !!data?.length }
          })
        )
    }
  })
  useAnnouncementQuery({
    showAll: true,
    options: {
      onSuccess: data =>
        dispatch(
          updateInstanceMePage({
            announcements: {
              shown: !!data?.length ? true : false,
              unread: data?.filter(announcement => !announcement.read).length
            }
          })
        )
    }
  })

  const instancePush = useSelector(getInstancePush, (prev, next) => prev?.global === next?.global)

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
      {mePage.followedTags.shown ? (
        <MenuRow
          iconFront='Hash'
          iconBack='ChevronRight'
          title={t('me.stacks.followedTags.name')}
          onPress={() => navigation.navigate('Tab-Me-FollowedTags')}
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
          onPress={() => navigation.navigate('Screen-Announcements', { showAll: true })}
        />
      ) : null}
      <MenuRow
        iconFront={instancePush ? 'Bell' : 'BellOff'}
        iconBack='ChevronRight'
        title={t('me.stacks.push.name')}
        content={t('me.root.push.content', { context: instancePush.global.toString() })}
        onPress={() => navigation.navigate('Tab-Me-Push')}
      />
    </MenuContainer>
  )
}

export default Collections
