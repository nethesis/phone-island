// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import React, { FC, memo, useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useEventListener } from '../../utils'

const ANIMATION_CONFIG = {
  initial: { height: 0, opacity: 0 },
  animate: { height: '300px', opacity: 1 },
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

const TranscriptionView: FC<TranscriptionViewProps> = memo(({ isVisible }) => {
  const { isOpen } = useSelector((state: RootState) => state.island)
  const { t } = useTranslation()

  const [allMessages, setAllMessages] = useState<TranscriptionMessage[]>([])
  const [visibleMessages, setVisibleMessages] = useState<TranscriptionMessage[]>([])
  const [hasNewContent, setHasNewContent] = useState(false)
  const [userScrolled, setUserScrolled] = useState(false)
  const [lastSeenMessageIndex, setLastSeenMessageIndex] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  const MAX_VISIBLE_MESSAGES = 50
  const BUFFER_MESSAGES = 10
  const SCROLL_DEBOUNCE_MS = 100

  // Update visible messages when all messages change
  useEffect(() => {
    const startIndex = Math.max(0, allMessages.length - MAX_VISIBLE_MESSAGES)
    const newVisibleMessages = allMessages.slice(startIndex)
    setVisibleMessages(newVisibleMessages)
  }, [allMessages])

  // Handle incoming transcription messages
  const addTranscriptionMessage = (data: any) => {
    const message: TranscriptionMessage = {
      id: data.uniqueid || Date.now().toString(),
      timestamp: data.timestamp || Date.now() / 1000,
      speaker: data.speaker_name || 'Unknown',
      speakerNumber: data.speaker_number || '',
      counterpart: data.speaker_counterpart_name || '',
      counterpartNumber: data.speaker_counterpart_number || '',
      text: data.transcription || '',
      isFinal: data.is_final || false,
    }

    setAllMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1]

      if (!message.isFinal) {
        if (lastMessage && lastMessage.speaker === message.speaker && !lastMessage.isFinal) {
          const updatedMessages = [...prevMessages]
          updatedMessages[updatedMessages.length - 1] = message
          return updatedMessages
        } else {
          return [...prevMessages, message]
        }
      } else {
        // Final message
        if (lastMessage && lastMessage.speaker === message.speaker && !lastMessage.isFinal) {
          const updatedMessages = [...prevMessages]
          updatedMessages[updatedMessages.length - 1] = message
          return updatedMessages
        } else {
          return [...prevMessages, message]
        }
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

  // Format timestamp
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  // Skeleton component for loading state
  const TranscriptionSkeleton: FC = () => (
    <div className='pi-space-y-4 pi-animate-pulse'>
      {[1, 2].map((i) => (
        <div key={i} className='pi-flex pi-flex-col pi-gap-2'>
          {/* Speaker skeleton */}
          <div className='pi-flex pi-items-center pi-justify-between'>
            <div className='pi-h-4 pi-bg-iconWhite pi-bg-opacity-20 pi-rounded pi-w-24'></div>
            <div className='pi-h-3 pi-bg-iconWhite pi-bg-opacity-20 pi-rounded pi-w-12'></div>
          </div>

          {/* Message skeleton */}
          <div className='pi-p-3 pi-rounded-lg pi-bg-surfaceSidebar dark:pi-bg-surfaceSidebarDark pi-border-l-3 pi-border-blue-400'>
            <div className='pi-space-y-2'>
              <div className='pi-h-4 pi-bg-iconWhite pi-bg-opacity-20 pi-rounded pi-w-full'></div>
              <div className='pi-h-4 pi-bg-iconWhite pi-bg-opacity-20 pi-rounded pi-w-3/4'></div>
              {i === 2 && (
                <div className='pi-h-4 pi-bg-iconWhite pi-bg-opacity-20 pi-rounded pi-w-1/2'></div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

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
      <span
        className={`${
          isFinal
            ? 'pi-text-iconWhite dark:pi-text-iconWhiteDark'
            : 'pi-text-iconWhite dark:pi-text-iconWhiteDark pi-opacity-80'
        }`}
      >
        {displayText}
        {!isFinal && (
          <span
            className={`pi-inline-block pi-w-2 pi-h-5 pi-bg-blue-400 pi-ml-1 ${
              showCursor ? 'pi-opacity-100' : 'pi-opacity-0'
            }`}
          >
            |
          </span>
        )}
      </span>
    )
  }

  const containerClassName = `pi-absolute pi-w-full pi-bg-surfaceSidebar dark:pi-bg-surfaceSidebarDark pi-flex pi-flex-col pi-text-iconWhite dark:pi-text-iconWhiteDark pi-top-[13rem] pi-left-0 -pi-z-10 pi-pointer-events-auto ${
    isOpen ? 'pi-px-6' : 'pi-px-4'
  }`

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div className={containerClassName} style={STYLE_CONFIG} {...ANIMATION_CONFIG}>
            <div className='pi-h-full pi-bg-surfaceSidebar dark:pi-bg-surfaceSidebarDark pi-rounded-lg pi-overflow-hidden pi-opacity-80 pi-relative'>
              <AnimatePresence>
                {hasNewContent && userScrolled && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    className='pi-absolute pi-top-3 pi-left-1/2 pi-transform pi--translate-x-1/2 pi-z-20 pi-mt-9'
                  >
                    <button
                      onClick={scrollToBottom}
                      className='pi-bg-blue-500 hover:pi-bg-blue-600 pi-text-white pi-px-4 pi-py-2 pi-rounded-full pi-text-sm pi-shadow-lg pi-flex pi-items-center pi-gap-2 pi-transition-all pi-duration-200 pi-border pi-border-blue-400 pi-backdrop-blur-sm'
                    >
                      <svg
                        className='pi-w-4 pi-h-4'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 14l-7 7m0 0l-7-7m7 7V3'
                        />
                      </svg>
                      {unseenMessagesCount > 1
                        ? t('TranscriptionView.New messages', { count: unseenMessagesCount })
                        : t('TranscriptionView.New message')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className={`pi-h-full pi-p-4 pi-mt-9 ${
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
                        className='pi-flex pi-flex-col pi-gap-2'
                      >
                        {/* Speaker Info */}
                        <div className='pi-flex pi-items-center pi-justify-between'>
                          <div className='pi-flex pi-items-center pi-gap-2'>
                            <span className='pi-font-semibold pi-text-blue-300 pi-text-sm'>
                              {message.speaker}
                            </span>
                            {message.speakerNumber && (
                              <span className='pi-text-xs pi-text-iconWhite dark:pi-text-iconWhiteDark pi-opacity-50'>
                                ({message.speakerNumber})
                              </span>
                            )}
                          </div>
                          <span className='pi-text-xs pi-text-iconWhite dark:pi-text-iconWhiteDark pi-opacity-50'>
                            {formatTimestamp(message.timestamp)}
                          </span>
                        </div>

                        {/* Message Content */}
                        <div
                          className={`pi-p-3 pi-rounded-lg pi-bg-surfaceSidebar dark:pi-bg-surfaceSidebarDark ${
                            message.isFinal ? 'pi-opacity-100' : 'pi-opacity-90'
                          } pi-border-l-3 pi-border-blue-400`}
                        >
                          <TypewriterText
                            text={message.text}
                            isFinal={message.isFinal}
                            speed={30}
                          />
                          {!message.isFinal && (
                            <div className='pi-text-xs pi-text-iconWhite dark:pi-text-iconWhiteDark pi-opacity-40 pi-mt-1'>
                              {t('TranscriptionView.Transcribing', 'transcribing...')}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={messagesEndRef} className='pi-pb-4' />
                  </div>
                )}
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
