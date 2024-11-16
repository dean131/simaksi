import { ResponseError, WebError } from "../utils/response-error.js";

const errorMiddleware = async (err, req, res, next) => {
    if (!err) {
        next();
        return;
    }

    if (err instanceof ResponseError) {
        res.status(err.status)
            .json({
                errors: err.message,
            })
            .end();
    } else if (err instanceof WebError) {
        req.flash("error", err.message);
        res.redirect(err.redirectTo);
    } else {
        res.status(500)
            .json({
                errors: err.message,
            })
            .end();
    }
};

export { errorMiddleware };
