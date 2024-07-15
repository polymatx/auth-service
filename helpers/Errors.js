const BaseError = require("./BaseError");

const errors = (module.exports = {
  UNKNOWN_ERROR: {
    status: 500,
    code: 3000,
    message: "UNKNOWN_ERROR",
  },
  USER_NOT_FOUND: {
    status: 404,
    code: 3001,
    message: "USER_NOT_FOUND",
  },
  WRONG_CREDENTIALS: {
    status: 401,
    code: 3002,
    message: "WRONG_CREDENTIALS",
  },
  USER_NOT_VERIFIED: {
    status: 420,
    code: 3003,
    message: "USER_NOT_VERIFIED",
  },
  INVALID_TOKEN: {
    status: 401,
    code: 3004,
    message: "INVALID_TOKEN",
  },
  INVALID_TOKEN_TYPE: {
    status: 400,
    code: 3005,
    message: "INVALID_TOKEN_TYPE",
  },
  INVALID_CLIENT: {
    status: 400,
    code: 3006,
    message: "INVALID_CLIENT",
  },
  INVALID_CLIENT_CREDENTIALS: {
    status: 401,
    code: 3007,
    message: "INVALID_CLIENT_CREDENTIALS",
  },
  UNSUPPORTED_GRANT_TYPE: {
    status: 400,
    code: 3008,
    message: "UNSUPPORTED_GRANT_TYPE",
  },
  APPLICATION_NOT_FOUND: {
    status: 404,
    code: 3009,
    message: "APPLICATION_NOT_FOUND",
  },
  INVALID_REFRESH_TOKEN: {
    status: 401,
    code: 3010,
    message: "INVALID_REFRESH_TOKEN",
  },
  REFRESH_TOKEN_REVOKED: {
    status: 401,
    code: 3011,
    message: "REFRESH_TOKEN_REVOKED",
  },
  PARSE_TOKEN_ERROR: {
    status: 500,
    code: 3012,
    message: "PARSE_TOKEN_ERROR",
  },
  INTERNAL_ERROR: {
    status: 500,
    code: 3013,
    message: "INTERNAL_ERROR",
  },
  USER_ALREADY_EXISTS: {
    status: 409,
    code: 3014,
    message: "USER_ALREADY_EXISTS.",
  },
  DATABASE_ERROR: {
    status: 502,
    code: 3015,
    message: "DATABASE_ERROR",
  },
  APPLICATION_ALREADY_EXISTS: {
    status: 409,
    code: 3016,
    message: "APPLICATION_ALREADY_EXISTS",
  },
  USER_HAS_BEEN_BLOCK: {
    status: 403,
    code: 3017,
    message: "USER_HAS_BEEN_BLOCK",
  },
  ERR_JWT_EXPIRED: {
    status: 401,
    code: 3018,
    message: "ERR_JWT_EXPIRED",
  },
});

class ApiError {
  static get(name) {
    if (errors[name]) {
      return new BaseError(errors[name]);
    }
    return new BaseError(errors.INTERNAL_ERROR);
  }

  static isBaseError(error) {
    return error !== null && error !== undefined && 'message' in error && 'code' in error && 'status' in error && 'toJSON' in error;
  }
}

module.exports = { ApiError };
