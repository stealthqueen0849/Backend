class ApiResponse{
    constructor(data, status, message="succes"){
        this.data = data,
        this.status = status,
        this.message = message
        this.success = status < 400
    }
}

export default ApiResponse