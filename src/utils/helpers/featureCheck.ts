import { getAccountStorage } from '@utils/storage/actions'

const features = [
  {
    feature: 'account_follow_notify',
    version: 3.3
  },
  {
    feature: 'notification_type_status',
    version: 3.3
  },
  {
    feature: 'account_return_suspended',
    version: 3.3
  },
  {
    feature: 'edit_post',
    version: 3.5
  },
  {
    feature: 'deprecate_auth_follow',
    version: 3.5
  },
  {
    feature: 'notification_type_update',
    version: 3.5
  },
  {
    feature: 'notification_type_admin_signup',
    version: 3.5
  },
  {
    feature: 'notification_types_positive_filter',
    version: 3.5
  },
  {
    feature: 'trends_new_path',
    version: 3.5
  },
  {
    feature: 'follow_tags',
    version: 4.0
  },
  {
    feature: 'notification_type_admin_report',
    version: 4.0
  },
  {
    feature: 'filter_server_side',
    version: 4.0
  }
]

export const featureCheck = (feature: string, v?: string): boolean =>
  (features.find(f => f.feature === feature)?.version || 999) <=
  parseFloat(v || getAccountStorage.string('version'))
