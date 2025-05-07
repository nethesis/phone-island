import React, { type FC, useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { formatTime } from '../../utils/genericFunctions/player'
import { useDispatch } from 'react-redux'
import { StyledCustomRange } from '../../styles/CustomRange.styles'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faPause, faTrash, faVolumeHigh } from '@fortawesome/free-solid-svg-icons'
import { eventDispatch, useEventListener } from '../../utils'

export const Progress: FC<ProgressTypes> = ({ isPlayer }) => {
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
  const { recorded, playing } = useSelector((state: RootState) => state.recorder)

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

  function stopPropagation(e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) {
    e.stopPropagation()
  }

  function handlePause() {
    dispatch.player.pauseAudioPlayer()
    dispatch.recorder.setPlaying(false)
    dispatch.recorder.setPaused(true)
    eventDispatch('phone-island-recording-paused', {})
  }
  useEventListener('phone-island-recording-pause', (data: {}) => {
    handlePause()
  })

  function handlePlay() {
    dispatch.player.startAudioPlayer(() => {
      // The callback for the end event of the audio player
      dispatch.recorder.setPlaying(false)
      dispatch.recorder.setPaused(true)
    })
    dispatch.recorder.setPlaying(true)
    eventDispatch('phone-island-recording-played', {})
  }
  useEventListener('phone-island-recording-play', (data: {}) => {
    handlePlay()
  })

  function handleDelete() {
    dispatch.recorder.resetRecorded()
    eventDispatch('phone-island-recording-deleted', {})
  }
  useEventListener('phone-island-recording-delete', (data: {}) => {
    handleDelete()
  })

  return (
    <div className='pi-w-full pi-h-full pi-flex pi-flex-col pi-items-center pi-justify-between pi-px-2'>
      {/* Player controls with progress bar */}
      <div className='pi-w-full pi-flex pi-items-center pi-justify-between pi-gap-2'>
        {isPlayer ? (
          <div className='pi-cursor-pointer pi-flex-none'>
            <FontAwesomeIcon
              icon={faVolumeHigh}
              className='pi-h-4 pi-w-4 pi-text-gray-700 dark:pi-text-gray-300'
            />
          </div>
        ) : (
          <>
            {audioPlayerPlaying ? (
              <div
                onClick={handlePause}
                className='pi-cursor-pointer pi-flex-none'
                data-tooltip-id='tooltip-pause-recorder-view'
                data-tooltip-content={'Pause'}
              >
                <FontAwesomeIcon
                  icon={faPause}
                  className='pi-h-4 pi-w-4 pi-text-gray-700 dark:pi-text-gray-300'
                />
              </div>
            ) : (
              <div
                onClick={handlePlay}
                className='pi-cursor-pointer pi-flex-none'
                data-tooltip-id='tooltip-play-recorder-view'
                data-tooltip-content={'Play'}
              >
                <FontAwesomeIcon
                  icon={faPlay}
                  className='pi-h-4 pi-w-4 pi-text-gray-700 dark:pi-text-gray-300'
                />
              </div>
            )}
          </>
        )}

        <div
          className='pi-w-full pi-flex-grow pi-mx-2'
          onClick={stopPropagation}
          onMouseDown={stopPropagation}
          onTouchStart={stopPropagation}
        >
          <StyledCustomRange
            data-stop-propagation={true}
            ref={progressBarRef}
            defaultValue={0}
            type='range'
            step='1'
            min='0'
            max={(trackDuration && trackDuration) || 0}
            onChange={handleProgressChange}
            className='pi-text-green-600 dark:pi-text-green-500'
          />
        </div>

        {!isPlayer && (
          <div
            onClick={handleDelete}
            className='pi-cursor-pointer pi-flex-none'
            data-tooltip-id='tooltip-delete-recorder-view'
            data-tooltip-content={'Delete'}
          >
            <FontAwesomeIcon
              icon={faTrash}
              className='pi-h-4 pi-w-4 pi-text-gray-700 dark:pi-text-gray-200'
            />
          </div>
        )}
      </div>

      {/* Time indicators */}
      <div className='pi-flex pi-justify-between pi-w-full pi-text-xs pi-mt-2 pi-mb-1'>
        <div className='pi-font-medium pi-text-gray-700 dark:pi-text-gray-200 pi-truncate pi-max-w-[45%]'>
          {timeProgress}
        </div>
        <div className='pi-font-medium pi-text-gray-700 dark:pi-text-gray-200 pi-truncate pi-max-w-[45%]'>
          {displayDuration}
        </div>
      </div>
    </div>
  )
}

export default Progress
export interface ProgressTypes {
  isPlayer?: boolean
}
