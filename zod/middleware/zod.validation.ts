import { Schema, ZodSchema } from "zod";
import { AppError } from "../../express/error/app.error";

export const inputValidation=(schema:ZodSchema,body:any)=>{
try{
const result=schema.safeParse(body);
if(result.success){
    return {status:true,data:result.data}
}else{
    const errors=result.error.errors.map((err)=>({
      path:err.path.join('.'),
      message:err.message
    }));
    return {status:false,errors};
 }
}catch(error){
    new AppError("Validation error",400,"Operational",error)
}
}