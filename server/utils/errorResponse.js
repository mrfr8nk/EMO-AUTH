class ErrorResponse extends Error {
    constructor(message, statusCode, field) {
        super(message);
        this.statusCode = statusCode;
        this.field = field;
    }
}

module.exports = ErrorResponse;
