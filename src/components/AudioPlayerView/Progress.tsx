import React, { type FC, useState, useEffect, useRef, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Dispatch, RootState } from '../../store'
import { formatTime } from '../../utils/genericFunctions/player'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPause, faPlay, faTrash } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'
import { eventDispatch, useEventListener } from '../../utils'
import { CustomThemedTooltip } from '../CustomThemedTooltip'

const AUDIO_FFT_VALUE: number = 64
const BARS_COUNT: number = 50

let globalAudioContext: AudioContext | null = null
let connectedElements = new Map<string, MediaElementAudioSourceNode>()

export const Progress: FC<ProgressTypes> = () => {
  const { audioPlayer, audioPlayerPlaying, audioPlayerTrackDuration } = useSelector(
    (state: RootState) => state.player,
  )
  const { recorded, playing } = useSelector((state: RootState) => state.recorder)

  const barsContainerRef = useRef<HTMLDivElement>(null)
  const [timeProgress, setTimeProgress] = useState<string>('00:00')
  const [displayDuration, setDisplayDuration] = useState<string>()
  const dispatch = useDispatch<Dispatch>()
  const [trackDuration, setTrackDuration] = useState<number>(
    (audioPlayerTrackDuration && Math.round(audioPlayerTrackDuration)) || 0,
  )
  const [staticBarHeights, setStaticBarHeights] = useState<number[]>([])
  const [currentProgressPercent, setCurrentProgressPercent] = useState<number>(0)
  const [audioAnalyzed, setAudioAnalyzed] = useState<boolean>(false)
  const [audioSrc, setAudioSrc] = useState<string>('')

  const frequencyDataRef = useRef<Uint8Array | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const { t } = useTranslation()

  useEffect(() => {
    if (audioPlayer?.current?.src && audioPlayer.current.src !== audioSrc) {
      setAudioSrc(audioPlayer.current.src)
      setAudioAnalyzed(false)
      setStaticBarHeights([])

      setCurrentProgressPercent(0)
      setTimeProgress('00:00')
    }
  }, [audioPlayer, audioSrc])

  const generateStaticBars = useCallback(async () => {
    if (audioPlayer?.current?.src && !audioAnalyzed) {
      try {
        const context = new AudioContext()
        const response = await fetch(audioPlayer.current.src)
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await context.decodeAudioData(arrayBuffer)

        audioBufferRef.current = audioBuffer

        const channelData = audioBuffer.getChannelData(0)
        const blockSize = Math.floor(channelData.length / BARS_COUNT)
        const heights: number[] = []

        for (let i = 0; i < BARS_COUNT; i++) {
          const startIndex = i * blockSize
          const endIndex = Math.min(startIndex + blockSize, channelData.length)

          let sum = 0
          for (let j = startIndex; j < endIndex; j++) {
            sum += channelData[j] * channelData[j]
          }
          const rms = Math.sqrt(sum / (endIndex - startIndex))

          const heightPercent = Math.max(40, rms * 200)
          heights.push(heightPercent)
        }

        setStaticBarHeights(heights)
        setAudioAnalyzed(true)
      } catch (error) {
        const randomHeights: number[] = []
        for (let i = 0; i < BARS_COUNT; i++) {
          const position = i / BARS_COUNT
          const value = Math.sin(position * Math.PI) * 50 + Math.random() * 20 + 40
          randomHeights.push(value)
        }
        setStaticBarHeights(randomHeights)
        setAudioAnalyzed(true)
      }
    }
  }, [audioPlayer, audioAnalyzed])

  useEffect(() => {
    if (recorded && audioPlayer?.current) {
      try {
        if (!globalAudioContext) {
          globalAudioContext = new AudioContext()
        } else if (globalAudioContext.state === 'suspended') {
          globalAudioContext.resume()
        }

        const audioUrl = audioPlayer.current.src

        if (!connectedElements.has(audioUrl)) {
          const analyser = globalAudioContext.createAnalyser()
          analyser.fftSize = AUDIO_FFT_VALUE

          const source = globalAudioContext.createMediaElementSource(audioPlayer.current)
          source.connect(analyser)
          analyser.connect(globalAudioContext.destination)

          connectedElements.set(audioUrl, source)
          analyserRef.current = analyser
          frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount)
        } else {
          const existingSource = connectedElements.get(audioUrl)
          if (existingSource && analyserRef.current) {
            frequencyDataRef.current = new Uint8Array(analyserRef.current.frequencyBinCount)
          }
        }

        if (!audioAnalyzed) {
          generateStaticBars()
        }
      } catch (error) {}
    }
  }, [recorded, audioPlayer, audioSrc, generateStaticBars, audioAnalyzed])

  useEffect(() => {
    if (staticBarHeights.length === 0) {
      const defaultHeights: number[] = []
      for (let i = 0; i < BARS_COUNT; i++) {
        const position = i / BARS_COUNT
        const height =
          40 + Math.sin(position * Math.PI * 2) * 30 + Math.sin(position * Math.PI * 6) * 10
        defaultHeights.push(height)
      }
      setStaticBarHeights(defaultHeights)
    }
  }, [staticBarHeights])

  useEffect(() => {
    const updateProgress = () => {
      if (!audioPlayer?.current) return

      const currentTime = audioPlayer.current.currentTime || 0
      setTimeProgress(formatTime(Math.round(currentTime)))

      if (trackDuration) {
        const percent = (currentTime / trackDuration) * 100
        setCurrentProgressPercent(percent)
      }

      if (audioPlayerPlaying) {
        requestAnimationFrame(updateProgress)
      }
    }

    if (audioPlayerPlaying) {
      requestAnimationFrame(updateProgress)
    }
  }, [audioPlayer, audioPlayerPlaying, trackDuration])

  useEffect(() => {
    if (audioPlayerTrackDuration) {
      setTrackDuration(Math.round(audioPlayerTrackDuration))
      setDisplayDuration(formatTime(audioPlayerTrackDuration))
    }
  }, [audioPlayerTrackDuration])

  const handleBarsClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barsContainerRef.current || !trackDuration) return

    const rect = barsContainerRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const clickPercent = (clickX / rect.width) * 100
    const newTime = (clickPercent / 100) * trackDuration

    dispatch.player.setAudioPlayerCurrentTime(newTime)
    setCurrentProgressPercent(clickPercent)
  }

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      setAudioAnalyzed(false)
      setStaticBarHeights([])
      setCurrentProgressPercent(0)
    }
  }, [])

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
    <>
      <div className='pi-w-full pi-h-12 pi-flex pi-items-center pi-justify-between pi-px-4 pi-gap-2'>
        {playing ? (
          <div
            style={{ transform: 'scale(1.15)' }}
            data-tooltip-id='tooltip-pause-recorder-view'
            data-tooltip-content={t('Tooltip.Pause') || ''}
            onClick={handlePause}
            className='pi-cursor-pointer'
          >
            <FontAwesomeIcon
              icon={faPause}
              className='pi-h-4 pi-w-4 pi-text-gray-700 dark:pi-text-gray-200'
            />
          </div>
        ) : (
          <div
            onClick={handlePlay}
            style={{ transform: 'scale(1.15)' }}
            data-tooltip-id='tooltip-play-recorder-view'
            data-tooltip-content={t('Tooltip.Play') || ''}
            className='pi-cursor-pointer'
          >
            <FontAwesomeIcon
              icon={faPlay}
              className='pi-h-4 pi-w-4 pi-text-gray-700 dark:pi-text-gray-200'
            />
          </div>
        )}
        <div
          className='pi-w-full pi-h-8 pi-flex pi-justify-between pi-items-center pi-cursor-pointer pi-relative'
          ref={barsContainerRef}
          onClick={handleBarsClick}
        >
          <div
            className='pi-absolute pi-bottom-0 pi-z-30'
            style={{
              left: `${currentProgressPercent}%`,
              transform: 'translateX(-50%)',
              height: '100%',
            }}
          >
            <div
              className='pi-bg-black dark:pi-bg-white pi-w-0.5'
              style={{
                height: 'calc(100% - 4px)',
                borderRadius: '0.5px',
                position: 'relative',
              }}
            >
              <div
                className='pi-absolute pi-bg-black dark:pi-bg-white pi-rounded-full pi-w-3 pi-h-3'
                style={{
                  top: '-4px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          </div>

          {staticBarHeights.map((height, index) => {
            const barPosition = (index / (BARS_COUNT - 1)) * 100
            const isPlayed = barPosition <= currentProgressPercent

            return (
              <div
                key={index}
                className={`pi-rounded-full pi-w-1 ${
                  isPlayed ? 'pi-bg-emerald-500' : 'pi-bg-gray-300'
                }`}
                style={{
                  height: `${height}%`,
                  minHeight: '10%',
                  transition: 'background-color 0.1s ease-in-out',
                }}
              />
            )
          })}
        </div>
        <div
          data-tooltip-id='tooltip-delete-recorder-view'
          data-tooltip-content={t('Tooltip.Delete') || ''}
          onClick={handleDelete}
          className='pi-cursor-pointer'
        >
          <FontAwesomeIcon
            icon={faTrash}
            className='pi-h-4 pi-w-4 pi-text-gray-700 dark:pi-text-gray-200'
          />
        </div>
      </div>
      <CustomThemedTooltip id='tooltip-play-recorder-view' place='top' />
      <CustomThemedTooltip id='tooltip-pause-recorder-view' place='top' />
      <CustomThemedTooltip id='tooltip-delete-recorder-view' place='top' />
    </>
  )
}

export default Progress

export interface ProgressTypes {}
