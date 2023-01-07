import { InfiniteData } from '@tanstack/react-query'
import { PagedResponse } from '@utils/api/helpers'

export const infinitePageParams = {
  getPreviousPageParam: (firstPage: PagedResponse<any>) => firstPage.links?.prev,
  getNextPageParam: (lastPage: PagedResponse<any>) => lastPage.links?.next
}

export const flattenPages = <T>(data: InfiniteData<PagedResponse<T[]>> | undefined): T[] | [] =>
  data?.pages.flatMap(page => page.body) || []
