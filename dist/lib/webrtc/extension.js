"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("../user/extensions.js");exports.isWebrtcTotallyFree=function(){var r=e.getWebrtcExtensions();if(r&&!Array.isArray(r)&&r.id){var t=e.getExtensionData(r.id);if(t&&t.conversations&&Object.values(t.conversations).length>0)return!1}return!0};
//# sourceMappingURL=extension.js.map
