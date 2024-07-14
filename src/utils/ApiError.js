class ApiError extends Error{
    constructor(
        status,
        message = "Something went wrong",
        stack = "",
        error,
    ){
        super(message);
        this.status = status
        this.error = error
        this.data = null
        this.success = false
 
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}