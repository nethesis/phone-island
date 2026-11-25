// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

// Aspect ratio of a video source picture until its real size is known
export const DEFAULT_PREVIEW_ASPECT_RATIO = 16 / 9

// Taller pictures (e.g. portrait) are letterboxed in a 4:3 box, wider ones (panoramic) in a
// 21:9 box: the island never grows too much, nor becomes too thin for the empty state
const MIN_BOX_ASPECT_RATIO = 4 / 3
const MAX_BOX_ASPECT_RATIO = 21 / 9

/**
 * Aspect ratio of the box showing a video source picture of the given aspect ratio: the box
 * takes the available width and its height follows (CSS aspect-ratio)
 */
export const getStreamingPreviewBoxRatio = (aspectRatio?: number): number => {
  const ratio =
    aspectRatio && isFinite(aspectRatio) && aspectRatio > 0
      ? aspectRatio
      : DEFAULT_PREVIEW_ASPECT_RATIO
  return Math.min(Math.max(ratio, MIN_BOX_ASPECT_RATIO), MAX_BOX_ASPECT_RATIO)
}

/**
 * Height of that box in the given width (estimate of the island height until the content of
 * the streaming view is measured)
 */
export const getStreamingPreviewHeight = (width: number, aspectRatio?: number): number =>
  Math.round(width / getStreamingPreviewBoxRatio(aspectRatio))
