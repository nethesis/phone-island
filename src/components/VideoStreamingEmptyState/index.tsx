import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVideoSlash } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

interface VideoStreamingEmptyStateProps {
    className?: string
    title?: string
    message?: string
}

const VideoStreamingEmptyState: React.FC<VideoStreamingEmptyStateProps> = ({
    className = '',
    title,
    message
}) => {
    const { t } = useTranslation()

    return (
        <div className={`pi-flex pi-items-center pi-justify-center pi-bg-gray-100 dark:pi-bg-gray-800 pi-rounded-lg pi-border pi-border-gray-300 dark:pi-border-gray-700 ${className}`}>
            <div className="pi-flex pi-flex-col pi-items-center pi-justify-center pi-space-y-4 pi-p-8">
                <FontAwesomeIcon
                    icon={faVideoSlash}
                    className="pi-text-3xl pi-text-gray-400 dark:pi-text-gray-600"
                />
                <div className="pi-text-center pi-space-y-2">
                    <h3 className="pi-text-lg pi-font-semibold pi-text-gray-700 dark:pi-text-gray-300">
                        {title || t('VideoStreaming.Video not available')}
                    </h3>
                    <p className="pi-text-sm pi-text-gray-500 dark:pi-text-gray-400 pi-max-w-xs">
                        {message || t('VideoStreaming.The video feed is currently unavailable')}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default VideoStreamingEmptyState
