const attachmentAspectRatio = ({
  total,
  index
}: {
  total: number
  index?: number
}) => {
  switch (total) {
    case 1:
    case 4:
      return 16 / 9
    case 2:
      return 8 / 9
    case 3:
      if (index === 2) {
        return 32 / 9
      } else {
        return 16 / 9
      }
    default:
      return 16 / 9
  }
}

export default attachmentAspectRatio
