class ResponseError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

class WebError extends Error {
    constructor(status, message, redirectTo) {
        super(message);
        this.status = status;
        this.redirectTo = redirectTo;
    }
}

export { ResponseError, WebError };
