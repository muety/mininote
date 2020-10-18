class ApiError extends Error {
    constructor(...params) {
        super(...params)
    }
}

class UnauthorizedError extends ApiError {
    constructor(...params) {
        super(...params)
    }
}

class NotFoundError extends ApiError {
    constructor(...params) {
        super(...params)
    }
}

export {
    ApiError,
    UnauthorizedError,
    NotFoundError
}