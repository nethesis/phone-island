"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("../../store/index.js");exports.isFromStreaming=function(t){var r=e.store.getState().streaming.videoSources;return!(!r||0===Object.keys(r).length)&&Object.values(r).some((function(e){return e.extension===t}))};
//# sourceMappingURL=isFromStreaming.js.map
