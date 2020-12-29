import { ComposeAction, ComposeState } from "./types"

const composeReducer = (
  state: ComposeState,
  action: ComposeAction
): ComposeState => {
  switch (action.type) {
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
            upload.local?.uri === action.payload.local?.uri
              ? { ...upload, remote: action.payload.remote, uploading: false }
              : upload
          )
        }
      }
    case 'attachment/delete':
      return {
        ...state,
        attachments: {
          ...state.attachments,
          uploads: state.attachments.uploads.filter(
            upload => upload.remote!.id !== action.payload
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
    default:
      throw new Error('Unexpected action')
  }
}

export default composeReducer
