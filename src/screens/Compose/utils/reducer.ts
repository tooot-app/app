import { ComposeAction, ComposeState } from './types'

const composeReducer = (
  state: ComposeState,
  action: ComposeAction
): ComposeState => {
  switch (action.type) {
    case 'loadDraft':
      const draft = action.payload
      return {
        ...state,
        ...(draft.spoiler?.length && {
          spoiler: {
            ...state.spoiler,
            active: true,
            raw: draft.spoiler
          }
        }),
        ...(draft.text?.length && {
          text: { ...state.text, raw: draft.text }
        }),
        ...(draft.poll && { poll: draft.poll }),
        ...(draft.attachments && { attachments: draft.attachments }),
        visibility: draft.visibility,
        visibilityLock: draft.visibilityLock,
        replyToStatus: draft.replyToStatus
      }
    case 'dirty':
      return { ...state, dirty: action.payload }
    case 'posting':
      return { ...state, posting: action.payload }
    case 'spoiler':
      return { ...state, spoiler: { ...state.spoiler, ...action.payload } }
    case 'text':
      return { ...state, text: { ...state.text, ...action.payload } }
    case 'tag':
      return { ...state, tag: action.payload }
    case 'emoji':
      return { ...state, emoji: action.payload }
    case 'poll':
      return { ...state, poll: { ...state.poll, ...action.payload } }
    case 'attachments/sensitive':
      return {
        ...state,
        attachments: { ...state.attachments, ...action.payload }
      }
    case 'attachment/upload/start':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          uploads: state.attachments.uploads.concat([action.payload])
        }
      }
    case 'attachment/upload/end':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          uploads: state.attachments.uploads.map(upload =>
            upload.local?.path === action.payload.local?.path
              ? { ...upload, remote: action.payload.remote, uploading: false }
              : upload
          )
        }
      }
    case 'attachment/upload/fail':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          uploads: state.attachments.uploads.filter(
            upload => upload.local?.hash !== action.payload
          )
        }
      }
    case 'attachment/delete':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          uploads: state.attachments.uploads.filter(
            upload => upload.remote?.id !== action.payload
          )
        }
      }
    case 'attachment/edit':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          uploads: state.attachments.uploads.map(upload =>
            upload.remote!.id === action.payload!.id
              ? { ...upload, remote: action.payload }
              : upload
          )
        }
      }
    case 'visibility':
      return { ...state, visibility: action.payload }
    case 'textInputFocus':
      return {
        ...state,
        textInputFocus: { ...state.textInputFocus, ...action.payload }
      }
    case 'removeReply':
      return { ...state, replyToStatus: undefined }
    default:
      throw new Error('Unexpected action')
  }
}

export default composeReducer
