import React from 'react';

export enum VirtualMode {
  UNSET,
  VIRTUAL,
  LIVE
};

// Global game options. This controls card content.
type GameOpts = {
  virtualMode: VirtualMode
};

export default GameOpts;