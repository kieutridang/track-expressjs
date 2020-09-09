class GeneralError extends Error {
  constructor(message) {
    super();
    this.message = message;
  }

  getCode() {
    if (this instanceof BadRequest) {
      return 400;
    }
    if (this instanceof InternalServer) {
      return 500;
    }
    if (this instanceof Unauthorized) {
      return 401;
    }
    if (this instanceof NotFound) {
      return 404;
    }
  }
}

class BadRequest extends GeneralError {}
class InternalServer extends GeneralError {}
class Unauthorized extends GeneralError {}
class NotFound extends GeneralError {}
class Forbidden extends GeneralError {}

module.exports = {
  GeneralError,
  BadRequest,
  InternalServer,
  Unauthorized,
  NotFound,
  Forbidden,
};
