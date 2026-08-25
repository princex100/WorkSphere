export class ApiResponse<T>{
    public statusCode:number
    public data:T
    public message:string
    public success:boolean

    constructor(
        statusCode:number,
        data:T,
        message:string
    ){
        this.statusCode=statusCode
        this.data=data
        this.success=statusCode<400
        this.message=message
    }

}