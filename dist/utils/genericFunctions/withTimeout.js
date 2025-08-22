"use strict";Object.defineProperty(exports,"__esModule",{value:!0});exports.withTimeout=function(e,t,o){var r=!1,u=setTimeout((function(){r||(r=!0,t())}),o);return function(){for(var t=[],o=0;o<arguments.length;o++)t[o]=arguments[o];r||(r=!0,clearTimeout(u),e(t))}};
//# sourceMappingURL=withTimeout.js.map
