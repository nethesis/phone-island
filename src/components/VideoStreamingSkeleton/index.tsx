import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideo } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

interface VideoStreamingSkeletonProps {
  className?: string
}

const VideoStreamingSkeleton: React.FC<VideoStreamingSkeletonProps> = ({ className = '' }) => {
  const { t } = useTranslation()

  return (
    <div className={`pi-flex pi-items-center pi-justify-center pi-bg-gray-100 dark:pi-bg-gray-800 pi-rounded-lg pi-animate-pulse ${className}`}>
      <div className="pi-flex pi-flex-col pi-items-center pi-justify-center pi-space-y-4">
        <div className="pi-relative">
          <FontAwesomeIcon 
            icon={faVideo} 
            className="pi-text-4xl pi-text-gray-400 dark:pi-text-gray-600 pi-animate-pulse" 
          />
          <div className="pi-absolute pi-inset-0 pi-rounded-full pi-border-2 pi-border-gray-300 pi-animate-ping"></div>
        </div>
        <div className="pi-text-sm pi-text-gray-500 dark:pi-text-gray-400 pi-animate-pulse">
          {t('VideoStreaming.Loading video')}
        </div>
      </div>
    </div>
  )
}

export default VideoStreamingSkeleton
