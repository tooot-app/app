export const aspectRatio = ({
  total,
  index,
  width,
  height
}: {
  total: number
  index?: number
  width?: number
  height?: number
}): number => {
  const defaultCrop =
    height && width
      ? height / width > 3 / 2
        ? 2 / 3
        : width / height > 4
        ? 4
        : width / height
      : 16 / 9

  const isEven = total % 2 == 0
  if (total > 5) {
    switch (isEven) {
      case true:
        return total / 2 / 2
      case false:
        if ((index || -2) + 1 == total) {
          return Math.ceil(total / 2)
        } else {
          return Math.ceil(total / 2) / 2
        }
    }
  } else {
    switch (isEven) {
      case true:
        return defaultCrop
      case false:
        if ((index || -2) + 1 == total) {
          return defaultCrop * 2
        } else {
          return defaultCrop
        }
    }
  }
}
