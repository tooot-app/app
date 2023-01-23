import { ComposeState } from '@screens/Compose/utils/types'
import apiInstance from '@utils/api/instance'
import detectLanguage from '@utils/helpers/detectLanguage'
import { RootStackParamList } from '@utils/navigation/navigators'
import * as Crypto from 'expo-crypto'
import { getPureContent } from './processText'

const composePost = async (
  params: RootStackParamList['Screen-Compose'],
  composeState: ComposeState
): Promise<Mastodon.Status> => {
  const body: {
    language?: string
    in_reply_to_id?: string
    spoiler_text?: string
    status: string
    visibility: ComposeState['visibility']
    sensitive?: boolean
    media_ids?: string[]
    media_attributes?: { id: string; description?: string }[]
    poll?: {
      expires_in: string
      multiple: boolean
      options: (string | undefined)[]
    }
  } = { status: composeState.text.raw, visibility: composeState.visibility }

  const detectedLanguage = await detectLanguage(
    getPureContent([composeState.spoiler.raw, composeState.text.raw].join('\n\n'))
  )
  if (detectedLanguage) {
    body.language = detectedLanguage.language
  }

  if (composeState.replyToStatus) {
    try {
      await apiInstance<Mastodon.Status>({
        method: 'get',
        url: `statuses/${composeState.replyToStatus.id}`
      })
    } catch (err: any) {
      if (err && err.status && err.status == 404) {
        return Promise.reject({ removeReply: true })
      }
    }
    body.in_reply_to_id = composeState.replyToStatus.id
  }

  if (composeState.spoiler.active) {
    body.spoiler_text = composeState.spoiler.raw
  }

  if (composeState.poll.active) {
    body.poll = {
      expires_in: composeState.poll.expire,
      multiple: composeState.poll.multiple,
      options: composeState.poll.options.filter(option => !!option)
    }
  }

  if (composeState.attachments.uploads.filter(upload => upload.remote && upload.remote.id).length) {
    body.sensitive = composeState.attachments.sensitive
    body.media_ids = []
    if (params?.type === 'edit') {
      body.media_attributes = []
    }

    composeState.attachments.uploads.forEach((attachment, index) => {
      body.media_ids?.push(attachment.remote!.id)

      if (params?.type === 'edit') {
        if (
          attachment.remote?.description !==
          params.incomingStatus.media_attachments[index].description
        ) {
          body.media_attributes?.push({
            id: attachment.remote!.id,
            description: attachment.remote!.description
          })
        }
      }
    })
  }

  return apiInstance<Mastodon.Status>({
    method: params?.type === 'edit' ? 'put' : 'post',
    url: params?.type === 'edit' ? `statuses/${params.incomingStatus.id}` : 'statuses',
    headers: {
      'Idempotency-Key': await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        composeState.spoiler.raw +
          composeState.text.raw +
          composeState.poll.options['0'] +
          composeState.poll.options['1'] +
          composeState.poll.options['2'] +
          composeState.poll.options['3'] +
          composeState.poll.multiple +
          composeState.poll.expire +
          composeState.attachments.sensitive +
          composeState.attachments.uploads.map(upload => upload.remote?.id) +
          composeState.visibility +
          (params?.type === 'edit' || params?.type === 'deleteEdit' ? Math.random().toString() : '')
      )
    },
    body
  }).then(res => res.body)
}

export default composePost
