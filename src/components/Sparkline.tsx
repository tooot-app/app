import { useTheme } from '@utils/styles/ThemeManager'
import { maxBy, minBy } from 'lodash'
import React from 'react'
import Svg, { G, Path } from 'react-native-svg'

export interface Props {
  data: number[]
  width: number
  height: number
  margin?: number
}

const Sparkline: React.FC<Props> = ({ data, width, height, margin = 0 }) => {
  const { colors } = useTheme()

  const dataToPoints = ({
    data,
    width,
    height
  }: {
    data: number[]
    width: number
    height: number
  }): { x: number; y: number }[] => {
    const max = maxBy(data) || 0
    const min = minBy(data) || 0
    const len = data.length

    const vfactor = (height - margin * 2) / (max - min || 2)
    const hfactor = (width - margin * 2) / (len - (len > 1 ? 1 : 0))

    return data.map((d, i) => ({
      x: i * hfactor + margin,
      y: (max === min ? 1 : max - d) * vfactor + margin
    }))
  }
  const points = dataToPoints({ data, width, height })
  const divisor = 0.25
  let prev: { x: number; y: number }
  const curve = (p: { x: number; y: number }) => {
    let res
    if (!prev) {
      res = [p.x, p.y]
    } else {
      const len = (p.x - prev.x) * divisor
      res = [
        'C',
        prev.x + len, // x1
        prev.y, // y1
        p.x - len, // x2
        p.y, // y2
        p.x, // x
        p.y // y
      ]
    }
    prev = p
    return res
  }
  const linePoints = points.map(p => curve(p)).reduce((a, b) => a.concat(b))
  const closePolyPoints = [
    'L' + points[points.length - 1].x,
    height - margin,
    margin,
    height - margin,
    margin,
    points[0].y
  ]
  const fillPoints = linePoints.concat(closePolyPoints)

  return (
    <Svg height={height} width={width} style={{ marginRight: margin }} fill='none'>
      <G>
        <Path d={'M' + fillPoints.join(' ')} fill={colors.blue} fillOpacity={0.1} />
        <Path
          d={'M' + linePoints.join(' ')}
          stroke={colors.blue}
          strokeWidth={1}
          strokeLinejoin='round'
          strokeLinecap='round'
        />
      </G>
    </Svg>
  )
}

export default Sparkline
