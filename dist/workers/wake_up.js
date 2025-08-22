"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("../utils/genericFunctions/exposeWorker.js").default((function(){var e=(new Date).getTime();setInterval((function(){var t=(new Date).getTime();t>e+4e3&&postMessage("wakeup"),e=t}),2e3)}));exports.default=e;
//# sourceMappingURL=wake_up.js.map
