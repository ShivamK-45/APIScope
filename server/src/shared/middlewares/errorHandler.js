import logger from "../config/logger.js";
import ResponseFormatter from "../utils/responseFormatter.js";

// Agent
const errorHandler = (err, req, res, next) => {
    let statusCode = req.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let errors = err.errors || null;

    logger.error('Error occured:', {
        message: err.message,
        statusCode,
        stack: err.stack,
        path: req.path,
        method: req.method,
    });

    if(err.name === "ValidationError"){
        statusCode = 400;
        message = "Validation Error";
        errors = Object.values(err.errors).map((error) => error.message);
    } else if(err.name === 'MongoServerError' && err.code === 11000){
        statusCode = 400;
        message = "Duplicate Key Error";
    } else if(err.name === 'JsonWebTokenError'){
        statusCode = 401;
        message = "Invalid Token";
    } else if(err.name === 'TokenExpiredError'){
        statusCode = 401;
        message = "Token Expired";
    };

    //res.status(statusCode).json(ResponseFormatter.error(message,statusCode, errors));
    res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
    name: err.name
});
}

export default errorHandler;