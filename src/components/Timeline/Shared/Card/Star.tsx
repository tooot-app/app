import { useTheme } from '@utils/styles/ThemeManager'
import { uniqueId } from 'lodash'
import { useEffect, useState } from 'react'
import { Defs, LinearGradient, Path, Stop, Svg } from 'react-native-svg'

interface StarProps {
  size: number
  strokeLinejoin: 'miter' | 'round'
  strokeLinecap: 'butt' | 'round'
  offset: number
}

const NUM_POINT = 5
export const Star: React.FC<StarProps> = ({ size, strokeLinejoin, strokeLinecap, offset }) => {
  const { colors } = useTheme()

  const innerRadius = 25
  const outerRadius = 50

  const [id, setId] = useState<string>('')
  useEffect(() => {
    setId(uniqueId())
  }, [])

  const center = Math.max(innerRadius, outerRadius)
  const angle = Math.PI / NUM_POINT
  const points = []

  for (let i = 0; i < NUM_POINT * 2; i++) {
    let radius = i % 2 === 0 ? outerRadius : innerRadius
    points.push(center + radius * Math.sin(i * angle))
    points.push(center - radius * Math.cos(i * angle))
  }

  return (
    <Svg width={size} height={size} viewBox={`0 0 100 100`}>
      <Defs>
        <LinearGradient id={id} x1='0' x2='100%' y1='0' y2='0'>
          <Stop offset={`0%`} stopColor={colors.yellow} />
          <Stop offset={`${offset}%`} stopColor={colors.yellow} />
          <Stop offset={`${offset}%`} stopColor={colors.secondary} />
        </LinearGradient>
      </Defs>
      <Path
        d={`M${points.toString()}Z`}
        fill={`url(#${id})`}
        strokeLinejoin={strokeLinejoin}
        strokeLinecap={strokeLinecap}
      />
    </Svg>
  )
}
