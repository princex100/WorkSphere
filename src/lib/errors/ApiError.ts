 type ValidationError={
        field:string;
        message:string;
    }


export class ApiError extends Error{

    public statusCode: number;
    public errors:ValidationError[]=[];

    constructor(

        message:string,
        statusCode:number,
        stack:string="",
        errors?:ValidationError[]

    ){

        super(message);

        this.name="ApiError";
        this.statusCode=statusCode;

        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this,this.constructor);
        }

        this.errors=errors??[];
    }
}