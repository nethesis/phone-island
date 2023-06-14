// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3

import styled from 'styled-components'

export const StyledCustomRange = styled.input.attrs({ type: 'range' })`
  font-size: 1.5rem;
  width: 100%;
  color: white;
  --thumb-height: 0.75rem;
  --track-height: 0.125rem;
  --track-color: #6b7280;
  --clip-edges: 0.125rem;

  position: relative;
  background: #fff0;
  overflow: hidden;
  appearance: none;
  margin: 0;

  &:active {
    cursor: grabbing;
  }

  &:disabled {
    filter: grayscale(1);
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* === WebKit specific styles === */

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: var(--thumb-height);
    --thumb-radius: calc((var(--thumb-height) * 0.5) - 0.0625rem);
    --clip-top: calc((var(--thumb-height) - var(--track-height)) * 0.5 - 0.0313rem);
    --clip-bottom: calc(var(--thumb-height) - var(--clip-top));
    --clip-further: calc(100% + 0.0625rem);
    --box-fill: calc(-100vmax - var(--thumb-width, var(--thumb-height))) 0 0 100vmax currentColor;

    width: var(--thumb-width, var(--thumb-height));
    background: linear-gradient(currentColor 0 0) scroll no-repeat left center / 50%
      calc(var(--track-height) + 0.0625rem);
    background-color: currentColor;
    box-shadow: var(--box-fill);
    border-radius: var(--thumb-width, var(--thumb-height));

    clip-path: polygon(
      100% -0.0625rem,
      var(--clip-edges) -0.0625rem,
      0 var(--clip-top),
      -100vmax var(--clip-top),
      -100vmax var(--clip-bottom),
      0 var(--clip-bottom),
      var(--clip-edges) 100%,
      var(--clip-further) var(--clip-further)
    );
  }

  &::-webkit-slider-runnable-track {
    background: linear-gradient(var(--track-color) 0 0) scroll no-repeat center / 100%
      calc(var(--track-height) + 0.0625rem);
  }

  &:disabled::-webkit-slider-thumb {
    cursor: not-allowed;
  }

  /* === Firefox specific styles === */
  -moz-appearance: none;
  transition: all ease 100ms;
  height: var(--thumb-height);

  &::-moz-range-thumb {
    background: currentColor;
    border: 0;
    width: var(--thumb-width, var(--thumb-height));
    border-radius: var(--thumb-width, var(--thumb-height));
  }

  &::-moz-range-track {
    width: 100%;
    background: var(--track-color);
  }

  &::-moz-range-progress {
    appearance: none;
    background: currentColor;
    transition-delay: 30ms;
  }

  &::-moz-range-track,
  &::-moz-range-progress {
    height: calc(var(--track-height) + 0.0625rem);
    border-radius: var(--track-height);
  }

  &:disabled::-moz-range-thumb {
    cursor: not-allowed;
  }
`
