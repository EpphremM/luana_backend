import { ZodSchema } from "zod";
import { AppError } from "../../express/error/app.error";

type ValidationStatusResponse<T = any> = {
    status: "success"  | "fail",
    data?:  T,
    errors?: {
        path: string,
        message: string
    }[]
}

export const validateInput=async <T = any>(schema:ZodSchema,body:T)=>{
try{
const result=await schema.safeParseAsync(body);
if(result.success){
    const status: ValidationStatusResponse<T> = {
        status: "success",
        data: result.data
    }
    return status;
}else{
    const errors=result.error.errors.map((err)=>({
      path:err.path.join('.'),
      message:err.message
    }));
    const status: ValidationStatusResponse = {
        status: "fail",
        errors
    }
    return status;
 }
}catch(error){
    new AppError("Validation error",400,"Operational",error)
}
}