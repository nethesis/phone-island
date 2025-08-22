"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("../../store/index.js");exports.getStreamingSourceId=function(t){var r=e.store.getState().streaming.videoSources;if(r&&0!==Object.keys(r).length){var n=Object.values(r).find((function(e){return e.extension===t}));return null==n?void 0:n.id}};
//# sourceMappingURL=getStreamingSourceId.js.map
