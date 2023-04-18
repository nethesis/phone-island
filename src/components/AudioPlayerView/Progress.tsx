import React, { type FC, useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { formatTime } from '../../utils/genericFunctions/player'
import { useDispatch } from 'react-redux'
import { StyledCustomRange } from '../../styles/CustomRange.styles'

export const Progress: FC<ProgressTypes> = () => {
  const { audioPlayer, audioPlayerPlaying, audioPlayerTrackDuration } = useSelector(
    (state: RootState) => state.player,
  )
  const progressBarRef = useRef<any>()
  const progressAnimationRef = useRef<any>()
  const [timeProgress, setTimeProgress] = useState<string>('00:00')
  const [displayDuration, setDisplayDuration] = useState<string>()
  const dispatch = useDispatch<Dispatch>()
  const [trackDuration, setTrackDuration] = useState<number>(
    (audioPlayerTrackDuration && Math.round(audioPlayerTrackDuration)) || 0,
  )

  const progressAnimation = useCallback(() => {
    const currentTime = audioPlayer?.current?.currentTime
    currentTime && setTimeProgress(formatTime(Math.round(currentTime)))
    progressBarRef.current.value = currentTime
    trackDuration &&
      currentTime &&
      progressBarRef.current.style.setProperty(
        '--range-progress',
        `${(currentTime / trackDuration) * 100}%`,
      )
    progressAnimationRef.current = requestAnimationFrame(progressAnimation)
  }, [audioPlayer, trackDuration, progressBarRef])

  useEffect(() => {
    if (audioPlayerPlaying) {
      progressAnimationRef.current = requestAnimationFrame(progressAnimation)
    } else {
      cancelAnimationFrame(progressAnimationRef.current)
    }
  }, [audioPlayerPlaying])

  useEffect(() => {
    if (audioPlayerTrackDuration) {
      setTrackDuration(Math.round(audioPlayerTrackDuration))
      setDisplayDuration(formatTime(audioPlayerTrackDuration))
    }
  }, [audioPlayerTrackDuration])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(progressAnimationRef.current)
    }
  }, [])

  function handleProgressChange() {
    dispatch.player.setAudioPlayerCurrentTime(progressBarRef.current.value)
  }

  return (
    <>
      <StyledCustomRange
        data-stop-propagation={true}
        ref={progressBarRef}
        defaultValue={0}
        type='range'
        step='1'
        min='0'
        max={(trackDuration && trackDuration) || 0}
        onChange={handleProgressChange}
      />
      <div className='pi-flex pi-justify-between pi-mt-1'>
        <div className='pi-font-bold'>{timeProgress}</div>
        <div className='pi-font-bold'>{displayDuration}</div>
      </div>
    </>
  )
}

export default Progress

export interface ProgressTypes {}
