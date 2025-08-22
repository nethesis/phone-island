"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("react"),r=require("./useCommittedRef.js");exports.useEventCallback=function(t){var u=r.default(t);return e.useCallback((function(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];return u.current&&u.current.apply(u,e)}),[u])};
//# sourceMappingURL=useEventCallback.js.map
