/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { useCallback } from 'react'
import { ScrollView } from 'react-native'
import {
  HandlerStateChangeEvent,
  State,
  TapGestureHandlerEventPayload
} from 'react-native-gesture-handler'
import { Dimensions } from '../@types'

/**
 * This is iOS only.
 * Same functionality for Android implemented inside usePanResponder hook.
 */
function useDoubleTapToZoom (
  scrollViewRef: React.RefObject<ScrollView>,
  scaled: boolean,
  screen: Dimensions
) {
  const handleDoubleTap = useCallback(
    ({
      nativeEvent
    }: HandlerStateChangeEvent<TapGestureHandlerEventPayload>) => {
      if (nativeEvent.state === State.ACTIVE) {
        const scrollResponderRef = scrollViewRef?.current?.getScrollResponder()

        const { absoluteX, absoluteY } = nativeEvent
        let targetX = 0
        let targetY = 0
        let targetWidth = screen.width
        let targetHeight = screen.height

        // Zooming in
        // TODO: Add more precise calculation of targetX, targetY based on touch
        if (!scaled) {
          targetX = absoluteX / 2
          targetY = absoluteY / 2
          targetWidth = screen.width / 2
          targetHeight = screen.height / 2
        }

        scrollResponderRef?.scrollResponderZoomTo({
          x: targetX,
          y: targetY,
          width: targetWidth,
          height: targetHeight,
          animated: true
        })
      }
    },
    [scaled]
  )

  return handleDoubleTap
}

export default useDoubleTapToZoom
