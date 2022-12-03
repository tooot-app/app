type ContextMenu = {
  key: string
  item: { onSelect: () => void; disabled: boolean; destructive: boolean; hidden: boolean }
  title: string
  icon: string
}
