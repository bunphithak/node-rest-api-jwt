class AppError extends Error {
    constructor (
        message,
        statusCode
    ) {
        super(message);
        this.statusCode = statusCode;
        this.statusCode = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        console.log('this.statusCode ====>', this.statusCode )
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError