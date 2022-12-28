import { PagedResponse } from '@utils/api/helpers'

export const infinitePageParams = {
  getPreviousPageParam: (firstPage: PagedResponse<any>) =>
    firstPage.links?.prev && { min_id: firstPage.links.next },
  getNextPageParam: (lastPage: PagedResponse<any>) =>
    lastPage.links?.next && { max_id: lastPage.links.next }
}
