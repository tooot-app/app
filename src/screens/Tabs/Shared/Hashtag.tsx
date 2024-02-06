import menuHashtag from '@components/contextMenu/hashtag'
import { HeaderRight } from '@components/Header'
import Timeline from '@components/Timeline'
import { featureCheck } from '@utils/helpers/featureCheck'
import { TabSharedStackScreenProps } from '@utils/navigation/navigators'
import { QueryKeyTimeline } from '@utils/queryHooks/timeline'
import React, { Fragment, useEffect } from 'react'
import * as DropdownMenu from 'zeego/dropdown-menu'

const TabSharedHashtag: React.FC<TabSharedStackScreenProps<'Tab-Shared-Hashtag'>> = ({
  navigation,
  route: {
    params: { tag_name }
  }
}) => {
  const queryKey: QueryKeyTimeline = ['Timeline', { page: 'Hashtag', tag_name }]

  const canFollowTags = featureCheck('follow_tags')
  const canFilterTag = featureCheck('filter_server_side')
  const mHashtag = menuHashtag({ tag_name, queryKey })

  useEffect(() => {
    navigation.setParams({ queryKey: queryKey })
  }, [])

  useEffect(() => {
    if (!canFollowTags && !canFilterTag) return

    navigation.setOptions({
      headerRight: () => (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <HeaderRight content='more-horizontal' onPress={() => {}} />
          </DropdownMenu.Trigger>

          <DropdownMenu.Content>
            {[mHashtag].map((menu, i) => (
              <Fragment key={i}>
                {menu.map((group, index) => (
                  <DropdownMenu.Group key={index}>
                    {group.map(item => {
                      switch (item.type) {
                        case 'item':
                          return (
                            <DropdownMenu.Item key={item.key} {...item.props}>
                              <DropdownMenu.ItemTitle children={item.title} />
                              {item.icon ? (
                                <DropdownMenu.ItemIcon ios={{ name: item.icon }} />
                              ) : null}
                            </DropdownMenu.Item>
                          )
                      }
                    })}
                  </DropdownMenu.Group>
                ))}
              </Fragment>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      )
    })
  }, [mHashtag])

  return <Timeline queryKey={queryKey} />
}

export default TabSharedHashtag
