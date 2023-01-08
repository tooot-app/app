// type ContextMenu = (
//   | {
//       type: 'group'
//       key: string
//       items: ContextMenuItem[]
//     }
//   | {
//       type: 'sub'
//       key: string
//       trigger: {
//         key: string
//         props: {
//           disabled: boolean
//           destructive: boolean
//           hidden: boolean
//         }
//         title: string
//         icon?: string
//       }
//       items: ContextMenuItem[]
//     }
// )[]

type ContextMenu = (ContextMenuItem | ContextMenuSub)[][]

type ContextMenuItem = {
  type: 'item'
  key: string
  props: {
    onSelect: () => void
    disabled: boolean
    destructive: boolean
    hidden: boolean
  }
  title: string
  icon?: string
}

type ContextMenuSub = {
  type: 'sub'
  key: string
  trigger: {
    key: string
    props: {
      disabled: boolean
      destructive: boolean
      hidden: boolean
    }
    title: string
    icon?: string
  }
  items: Omit<ContextMenuItem, 'type'>[]
}
