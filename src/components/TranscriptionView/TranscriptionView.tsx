// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, memo, useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useEventListener, eventDispatch } from '../../utils'
import { Button } from '../Button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleUp, faArrowDown, faVectorSquare } from '@fortawesome/free-solid-svg-icons'

const ANIMATION_CONFIG = {
  initial: { height: 0, opacity: 0 },
  animate: { height: '360px', opacity: 1 },
  exit: { height: 0, opacity: 0 },
  transition: {
    duration: 0.1,
    ease: 'easeOut',
  },
}

const STYLE_CONFIG = {
  borderBottomLeftRadius: '20px',
  borderBottomRightRadius: '20px',
  transformOrigin: 'top',
  overflow: 'hidden',
} as const

interface TranscriptionViewProps {
  isVisible: boolean
}

interface TranscriptionMessage {
  id: string
  timestamp: number
  speaker: string
  speakerNumber: string
  counterpart: string
  counterpartNumber: string
  text: string
  isFinal: boolean
}

// Component for animated dots when message is not final
const TypingDots: FC = () => {
  return (
    <div className='pi-inline-flex pi-items-center pi-gap-1 pi-ml-2'>
      <motion.div
        className='pi-w-1 pi-h-1 pi-bg-blue-300 pi-rounded-full'
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
      />
      <motion.div
        className='pi-w-1 pi-h-1 pi-bg-blue-300 pi-rounded-full'
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
      />
      <motion.div
        className='pi-w-1 pi-h-1 pi-bg-blue-300 pi-rounded-full'
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
      />
    </div>
  )
}

const TypewriterText: FC<{ text: string; isFinal: boolean; speed?: number }> = ({
  text,
  isFinal,
  speed = 50,
}) => {
  const [displayText, setDisplayText] = useState('')
  const [showCursor, setShowCursor] = useState(!isFinal)

  useEffect(() => {
    if (isFinal) {
      setDisplayText(text)
      setShowCursor(false)
      return
    }

    let currentIndex = 0
    setDisplayText('')

    const typeInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(typeInterval)
        if (!isFinal) {
          setShowCursor(true)
        }
      }
    }, speed)

    return () => clearInterval(typeInterval)
  }, [text, isFinal, speed])

  useEffect(() => {
    if (!showCursor) return

    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev)
    }, 500)

    return () => clearInterval(cursorInterval)
  }, [showCursor])

  return (
    <div className='pi-inline-flex pi-items-center pi-flex-wrap'>
      <span>{displayText}</span>
      {!isFinal && <TypingDots />}
    </div>
  )
}

const TranscriptionView: FC<TranscriptionViewProps> = memo(({ isVisible }) => {
  const { actionsExpanded, view } = useSelector((state: RootState) => state.island)
  const currentUser = useSelector((state: RootState) => state.currentUser)
  const { t } = useTranslation()

  const [allMessages, setAllMessages] = useState<TranscriptionMessage[]>([])
  const [visibleMessages, setVisibleMessages] = useState<TranscriptionMessage[]>([])
  const [hasNewContent, setHasNewContent] = useState(false)
  const [userScrolled, setUserScrolled] = useState(false)
  const [lastSeenMessageIndex, setLastSeenMessageIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  const MAX_VISIBLE_MESSAGES = 100
  const BUFFER_MESSAGES = 10
  const SCROLL_DEBOUNCE_MS = 100

  // Function to check if a speaker number belongs to current user
  const isMyNumber = (speakerNumber: string): boolean => {
    if (!currentUser || !speakerNumber) return false

    // Check main extension from endpoints
    if (currentUser.endpoints?.mainextension?.[0]?.id === speakerNumber) return true

    // Check other extensions in endpoints
    if (currentUser.endpoints?.extension) {
      return Object.values(currentUser.endpoints.extension).some(
        (ext: any) => ext.id === speakerNumber || ext.exten === speakerNumber,
      )
    }

    return false
  }

  // Update visible messages when all messages change
  useEffect(() => {
    const startIndex = Math.max(0, allMessages.length - MAX_VISIBLE_MESSAGES)
    const newVisibleMessages = allMessages.slice(startIndex)
    setVisibleMessages(newVisibleMessages)
  }, [allMessages])

  // Handle incoming transcription messages
  const addTranscriptionMessage = (data: any) => {
    const uniqueId = `${data.uniqueid}_${data.timestamp}`

    const message: TranscriptionMessage = {
      id: uniqueId,
      timestamp: data.timestamp || 0,
      speaker: data.speaker_name || 'Unknown',
      speakerNumber: data.speaker_number || '',
      counterpart: data.speaker_counterpart_name || '',
      counterpartNumber: data.speaker_counterpart_number || '',
      text: data.transcription || '',
      isFinal: data.is_final || false,
    }

    setAllMessages((prevMessages) => {
      // Check if message with same unique ID already exists
      const existingMessageIndex = prevMessages.findIndex((msg) => msg.id === uniqueId)

      if (existingMessageIndex !== -1) {
        // Update existing message (same uniqueid + timestamp)
        const updatedMessages = [...prevMessages]
        updatedMessages[existingMessageIndex] = message
        return updatedMessages
      } else {
        // Add new message - each uniqueid + timestamp combination is a separate message
        return [...prevMessages, message]
      }
    })
  }

  // Check if user is at the bottom of the scroll area
  const isAtBottom = () => {
    if (!scrollContainerRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current
    return scrollHeight - scrollTop <= clientHeight + 10 // 10px tolerance
  }

  // Handle scroll events to detect user scrolling
  const handleScroll = () => {
    if (!scrollContainerRef.current) return

    const atBottom = isAtBottom()
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current

    if (atBottom) {
      // User is at bottom, clear indicators and enable auto-scroll
      setHasNewContent(false)
      setUserScrolled(false)
      setAutoScroll(true)
      setLastSeenMessageIndex(allMessages.length)
    } else {
      setUserScrolled(true)
      setAutoScroll(false)
    }
  }

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight

      // Update state
      setHasNewContent(false)
      setUserScrolled(false)
      setAutoScroll(true)
      setLastSeenMessageIndex(allMessages.length)
    }
  }

  // Calculate unseen messages count
  const unseenMessagesCount = Math.max(0, allMessages.length - lastSeenMessageIndex)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (allMessages.length === 0) return

    if (autoScroll && scrollContainerRef.current) {
      // Auto-scroll to bottom immediately for new messages
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight
        }
      }, 100)
    } else if (userScrolled && !autoScroll) {
      // If user has scrolled up and there's a new message, show the indicator
      setHasNewContent(true)
    }
  }, [allMessages])

  useEffect(() => {
    if (isVisible && allMessages.length > 0) {
      setAutoScroll(true)
      setUserScrolled(false)
      setHasNewContent(false)
    }
  }, [isVisible])

  // Listen for transcription events
  useEventListener('phone-island-conversation-transcription', (transcriptionData: any) => {
    addTranscriptionMessage(transcriptionData)
  })

  // Format timestamp - converts seconds from call start to MM:SS format
  const formatTimestamp = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60)
    const seconds = Math.floor(timestamp % 60)
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Skeleton component for loading state
  const TranscriptionSkeleton: FC = () => (
    <div className='pi-space-y-2 pi-animate-pulse'>
      {/* First shorter bar */}
      <div className='pi-h-4 pi-bg-gray-200 dark:pi-bg-gray-700 pi-rounded pi-w-2/5'></div>
      {/* Second longer bar */}
      <div className='pi-h-4 pi-bg-gray-200 dark:pi-bg-gray-700 pi-rounded pi-w-4/5'></div>
      {/* First shorter bar */}
      <div className='pi-h-4 pi-bg-gray-200 dark:pi-bg-gray-700 pi-rounded pi-w-2/5'></div>
      {/* Third medium bar */}
      <div className='pi-h-4 pi-bg-gray-200 dark:pi-bg-gray-700 pi-rounded pi-w-4/5'></div>
    </div>
  )

  const containerClassName = `pi-absolute pi-w-full pi-bg-elevationL2 pi-flex pi-flex-col pi-text-iconWhite dark:pi-text-iconWhiteDark pi-left-0 -pi-z-10 pi-pointer-events-auto ${
    view === 'settings' || actionsExpanded ? 'pi-top-[17rem]' : 'pi-top-[13rem]'
  }`

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div className={containerClassName} style={STYLE_CONFIG} {...ANIMATION_CONFIG}>
            <div className='pi-h-full pi-rounded-lg pi-overflow-hidden pi-bg-elevationL2 dark:pi-bg-elevationL2Dark pi-relative pi-flex pi-flex-col pi-border-2 pi-border-gray-100 dark:pi-border-gray-600 pi-shadow-lg'>
              {/* Main Content Card */}
              <div className='pi-flex-1 pi-pt-4 pi-px-4 pi-mt-8'>
                <div className='pi-h-60 pi-bg-gray-100 dark:pi-bg-gray-800 pi-rounded-lg pi-border pi-border-gray-200 dark:pi-border-gray-700 pi-overflow-hidden pi-flex pi-flex-col'>
                  <AnimatePresence>
                    {hasNewContent && userScrolled && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.9 }}
                        className='pi-absolute pi-top-16 pi-left-0 pi-right-0 pi-flex pi-justify-center pi-z-20'
                      >
                        <button
                          onClick={scrollToBottom}
                          className='pi-bg-phoneIslandActive dark:pi-bg-phoneIslandActiveDark hover:pi-bg-gray-500 dark:hover:pi-bg-gray-50 focus:pi-ring-emerald-500 dark:focus:pi-ring-emerald-300 pi-text-primaryInvert dark:pi-text-primaryInvertDark pi-px-4 pi-py-2 pi-rounded-full pi-text-sm pi-shadow-lg pi-flex pi-items-center pi-gap-2 pi-transition-all pi-duration-200 pi-border pi-backdrop-blur-sm'
                        >
                          <FontAwesomeIcon icon={faArrowDown} className='pi-w-4 pi-h-4' />
                          {unseenMessagesCount > 1
                            ? t('TranscriptionView.New messages')
                            : t('TranscriptionView.New message')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className={`pi-flex-1 pi-p-4 ${
                      visibleMessages.length > 0
                        ? 'pi-overflow-y-auto pi-scrollbar-thin pi-scrollbar-thumb-gray-400 pi-scrollbar-thumb-rounded-full pi-scrollbar-thumb-opacity-50 pi-scrollbar-track-gray-200 dark:pi-scrollbar-track-gray-900 pi-scrollbar-track-rounded-full pi-scrollbar-track-opacity-25'
                        : 'pi-overflow-hidden'
                    }`}
                  >
                    {visibleMessages.length === 0 ? (
                      <TranscriptionSkeleton />
                    ) : (
                      <div className='pi-space-y-4'>
                        {/* Show indicator if there are more messages than displayed */}
                        {allMessages.length > MAX_VISIBLE_MESSAGES && (
                          <div className='pi-text-center pi-py-2 pi-text-xs pi-text-gray-500 dark:pi-text-gray-400 pi-border-b pi-border-gray-200 dark:pi-border-gray-700'>
                            {t('TranscriptionView.Showing messages', {
                              visible: visibleMessages.length,
                              total: allMessages.length,
                            })}
                          </div>
                        )}

                        {visibleMessages.map((message, index) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className='pi-mb-4'
                          >
                            {/* Speaker Name */}
                            <div className='pi-mb-2'>
                              <span className='pi-font-medium pi-text-xs pi-text-secondaryNeutral dark:pi-text-secondaryNeutralDark'>
                                {isMyNumber(message.speakerNumber)
                                  ? t('Common.Me', 'Me')
                                  : message.speaker}
                              </span>
                            </div>

                            {/* Message Bubble with Background */}
                            <div
                              className={`pi-relative pi-p-3 pi-rounded-lg pi-text-xs pi-font-regular ${
                                isMyNumber(message.speakerNumber)
                                  ? 'pi-text-gray-800 dark:pi-text-gray-100 pi-bg-gray-200 dark:pi-bg-gray-600'
                                  : 'pi-text-indigo-800 dark:pi-text-indigo-100 pi-bg-indigo-100 dark:pi-bg-indigo-700'
                              }`}
                            >
                              <div className='pi-flex pi-items-start pi-justify-between pi-gap-3'>
                                <div className='pi-flex-1'>
                                  <TypewriterText
                                    text={message.text}
                                    isFinal={message.isFinal}
                                    speed={30}
                                  />
                                </div>
                                {/* Timestamp on the right */}
                                <div
                                  className={`pi-flex-shrink-0 pi-mt-1 pi-text-xs pi-font-regular ${
                                    isMyNumber(message.speakerNumber)
                                      ? 'pi-text-gray-800 dark:pi-text-gray-100 pi-bg-gray-200 dark:pi-bg-gray-600'
                                      : 'pi-text-indigo-800 dark:pi-text-indigo-100 pi-bg-indigo-100 dark:pi-bg-indigo-700'
                                  }`}
                                >
                                  {formatTimestamp(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        <div ref={messagesEndRef} className='pi-pb-4' />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer with Close Button */}
              <div className='pi-flex pi-items-center pi-justify-center pi-py-2'>
                <button
                  onClick={() => eventDispatch('phone-island-transcription-close', {})}
                  className='pi-bg-transparent dark:enabled:hover:pi-bg-gray-700/30 enabled:hover:pi-bg-gray-300/70 focus:pi-ring-offset-gray-200 dark:focus:pi-ring-gray-500 focus:pi-ring-gray-400 pi-text-secondaryNeutral pi-outline-none pi-border-transparent dark:pi-text-secondaryNeutralDark pi-h-12 pi-w-24 pi-rounded-fullpi-px-4 pi-py-2 pi-rounded-full pi-text-lg  pi-flex pi-items-center pi-gap-2 pi-transition-all pi-duration-200 pi-border pi-backdrop-blur-sm'
                >
                  <FontAwesomeIcon icon={faAngleUp} className='pi-w-4 pi-h-4' />
                  {t('Common.Close')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
})

TranscriptionView.displayName = 'TranscriptionView'

export default TranscriptionView
