import React, { type FC, useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { formatTime } from '../../utils/genericFunctions/player'

export const Progress: FC<ProgressTypes> = () => {
  const { audioPlayer, audioPlayerPlaying, audioPlayerTrackDuration } = useSelector(
    (state: RootState) => state.player,
  )

  const progressBarRef = useRef<any>()

  const progressAnimationRef = useRef<any>()

  const [timeProgress, setTimeProgress] = useState<string>('00:00')

  const [isPlaying, setIsPlaying] = useState(false)

  const [displayDuration, setDisplayDuration] = useState<string>()

  const [trackDuration, setTrackDuration] = useState<number>(
    (audioPlayerTrackDuration && Math.round(audioPlayerTrackDuration)) || 0,
  )

  // const onScrub = (value) => {
  //   // Clear any timers already running
  //   clearInterval(intervalRef.current)
  //   if (audioPlayer && audioPlayer.current) {
  //     audioPlayer.current.currentTime = value
  //     setTrackProgress(audioPlayer.current.currentTime)
  //   }
  // }

  // const startTimer = () => {
  //   // Clear any timers already running
  //   clearInterval(intervalRef.current)

  //   if (audioPlayer && audioPlayer.current) {
  //     if (audioPlayer.current.ended) {
  //       setTrackProgress(0)
  //     } else {
  //       console.warn('currentTime')
  //       console.warn(audioPlayer.current.currentTime)

  //       intervalRef.current = setInterval(() => {
  //         audioPlayer && audioPlayer.current && setTrackProgress(audioPlayer.current.currentTime)
  //       }, 1000)
  //     }
  //   }
  // }

  const progressAnimation = useCallback(() => {

    if (!audioPlayerPlaying) return

    const currentTime = audioPlayer?.current?.currentTime
    currentTime && setTimeProgress(formatTime(Math.round(currentTime)))
    progressBarRef.current.value = currentTime
    trackDuration &&
      currentTime &&
      progressBarRef.current.style.setProperty(
        '--range-progress',
        `${(currentTime / trackDuration) * 100}%`,
      )

    console.log(currentTime)
    trackDuration && currentTime && console.log(`${(currentTime / trackDuration) * 100}%`)

    console.log('process animation')

    progressAnimationRef.current = requestAnimationFrame(progressAnimation)
  }, [audioPlayer, trackDuration, progressBarRef])

  // const onScrubEnd = () => {
  //   // If not already playing, start
  //   if (!isPlaying) {
  //     setIsPlaying(true)
  //   }
  //   startTimer()
  // }

  useEffect(() => {

    console.warn(audioPlayerPlaying)

    if (audioPlayerPlaying) {
      progressAnimationRef.current = requestAnimationFrame(progressAnimation)
    }
  }, [audioPlayerPlaying])

  useEffect(() => {
    if (audioPlayerTrackDuration) {
      setTrackDuration(Math.round(audioPlayerTrackDuration))
      setDisplayDuration(formatTime(audioPlayerTrackDuration))
    }
  }, [audioPlayerTrackDuration])

  // const currentPercentage = duration ? `${(trackProgress / duration) * 100}%` : '0%'

  // const trackStyling = `
  //   -webkit-gradient(linear, 0% 0%, 100% 0%, color-stop(${currentPercentage}, #fffff), color-stop(${currentPercentage}, #CACACA))
  // `

  return (
    <>
      <input
        data-stop-propagation={true}
        ref={progressBarRef}
        defaultValue={0}
        type='range'
        step='1'
        min='0'
        max={(trackDuration && trackDuration) || 0}
        className='pi-range pi-w-full'
        // onChange={(e) => onScrub(e.target.value)}
        // onMouseUp={onScrubEnd}
        // onKeyUp={onScrubEnd}
        style={{ height: '2px', margin: '0px' }}
      />
      <div className='pi-flex pi-justify-between pi-mt-2'>
        <div className='pi-font-bold'>{timeProgress}</div>
        <div className='pi-font-bold'>{displayDuration}</div>
      </div>
    </>
  )
}

export default Progress

export interface ProgressTypes {}
