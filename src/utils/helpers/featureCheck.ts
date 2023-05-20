import { getAccountStorage } from '@utils/storage/actions'

type Features =
  | 'account_follow_notify'
  | 'notification_type_status'
  | 'account_return_suspended'
  | 'edit_post'
  | 'deprecate_auth_follow'
  | 'notification_type_update'
  | 'notification_type_admin_signup'
  | 'notification_types_positive_filter'
  | 'trends_new_path'
  | 'follow_tags'
  | 'notification_type_admin_report'
  | 'filter_server_side'
  | 'instance_new_path'
  | 'edit_media_details'

const features: { feature: Features; version: number }[] = [
  { feature: 'account_follow_notify', version: 3.3 },
  { feature: 'notification_type_status', version: 3.3 },
  { feature: 'account_return_suspended', version: 3.3 },
  { feature: 'edit_post', version: 3.5 },
  { feature: 'deprecate_auth_follow', version: 3.5 },
  { feature: 'notification_type_update', version: 3.5 },
  { feature: 'notification_type_admin_signup', version: 3.5 },
  { feature: 'notification_types_positive_filter', version: 3.5 },
  { feature: 'trends_new_path', version: 3.5 },
  { feature: 'follow_tags', version: 4.0 },
  { feature: 'notification_type_admin_report', version: 4.0 },
  { feature: 'filter_server_side', version: 4.0 },
  { feature: 'instance_new_path', version: 4.0 },
  { feature: 'edit_media_details', version: 4.1 }
]

export const featureCheck = (feature: Features, v?: string): boolean =>
  v || getAccountStorage.string('version')
    ? (features.find(f => f.feature === feature)?.version || 999) <=
      parseFloat(v || getAccountStorage.string('version'))
    : false
