import { StyleConstants } from '@utils/styles/constants'
import { View } from 'react-native'
import { Star } from './Star'

interface StarRatingProps {
  rating?: number

  unit?: 'full' | 'half' | 'float'
  size?: number
  count?: number
  roundedCorner?: boolean
}

const starUnitMap = {
  full: 100,
  half: 50,
  float: 10
}
export const Rating: React.FC<StarRatingProps> = ({
  rating,
  size = StyleConstants.Font.Size.M,
  count = 5,
  roundedCorner = true,
  unit = 'float'
}) => {
  if (!rating) return null

  const unitValue = starUnitMap[unit]

  const getSelectedOffsetPercent = (starIndex: number) => {
    const roundedSelectedValue = Math.floor(rating)
    if (starIndex < roundedSelectedValue) {
      return 100
    } else if (starIndex > roundedSelectedValue) {
      return 0
    } else {
      const currentStarOffsetPercentage = (rating % 1) * 100
      return Math.ceil(currentStarOffsetPercentage / unitValue) * unitValue
    }
  }

  return (
    <View style={{ flexDirection: 'row' }}>
      {Array.from({ length: count }, (v, i) => {
        return (
          <Star
            key={i}
            size={size}
            strokeLinejoin={roundedCorner ? 'round' : 'miter'}
            strokeLinecap={roundedCorner ? 'round' : 'butt'}
            offset={getSelectedOffsetPercent(i)}
          />
        )
      })}
    </View>
  )
}
