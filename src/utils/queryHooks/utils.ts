import { InstanceResponse } from '@api/instance'

export const infinitePageParams = {
  getPreviousPageParam: (firstPage: InstanceResponse<any>) =>
    firstPage.links?.prev && { since_id: firstPage.links.next },
  getNextPageParam: (lastPage: InstanceResponse<any>) =>
    lastPage.links?.next && { max_id: lastPage.links.next }
}
