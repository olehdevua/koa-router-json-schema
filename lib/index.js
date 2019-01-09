"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createValidationMdw;

var _ajv = _interopRequireDefault(require("ajv"));

var _fastJsonStringify = _interopRequireDefault(require("fast-json-stringify"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const ajv = new _ajv.default();

function createValidationMdw(schemas) {
  const queryValidator = schemas.query ? ajv.compile(schemas.query) : noop;
  const bodyValidator = schemas.body ? ajv.compile(schemas.body) : noop;
  const bodyToStringMapping = {};
  if (schemas.response) Object.keys(schemas.response).forEach(status => {
    bodyToStringMapping[status] = (0, _fastJsonStringify.default)(schemas.response[status]);
  });
  return async function validation(ctx, next) {
    const logger = ctx.logger || console;
    const isQueryValid = queryValidator(ctx.request.query);

    if (!isQueryValid) {
      logger.error("query is invalid", queryValidator.errors);
      ctx.status = 404;
      ctx.body = {
        error: {
          message: "query is invalid"
        }
      };
    }

    const isBodyValid = bodyValidator(ctx.request.body);

    if (!isBodyValid) {
      logger.error("request body is invalid", bodyValidator.errors);
      ctx.status = 404;
      ctx.body = {
        error: {
          message: "request body is invalid"
        }
      };
    }

    await next();
    if (!schemas.response) return;
    if (!schemas.response[ctx.status]) return;

    if (!isPlainObject(ctx.body)) {
      logger.error("response is not a json object");
      ctx.status = 500;
      ctx.body = {
        error: {
          message: "response is not a json object"
        }
      };
      if (!schemas.response[ctx.status]) return;
    }

    const body = bodyToStringMapping[ctx.status](ctx.body);
    ctx.body = body;
  };
}

function noop() {
  return true;
}

function isPlainObject(obj) {
  return typeof obj === "object" && typeof obj.pipe === "undefined" && !Buffer.isBuffer(obj);
}
//# sourceMappingURL=index.js.map