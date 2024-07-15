const i18n = require("i18n");

class BaseError extends Error {
  constructor({ message, code, status, object = {} }, locale = "en") {
    super();

    this.messageName = message;

    i18n.setLocale(locale);

    this.message = i18n.__(this.messageName);
    this.code = code;
    this.status = status <= 300 ? "success" : "fail";
    this.statusCode = status;
    this.object = object;
  }

  toJSON(locale) {
    this._toLocale(locale);
    return {
      status: this.status,
      code: this.code,
      message: this.message,
      object: this.object || {},
    };
  }

  toOAuthorizeError() {
      return this;
    // return {
    //   message: this.message,
    //   code: this.code,
    //   status: this.statusCode,
    // };
  }

  _toLocale(locale) {
    i18n.setLocale(locale);
    this.message = i18n.__(this.messageName);
    return this;
  }
}

module.exports = BaseError;
