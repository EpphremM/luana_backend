import { z } from "zod";
import { PermissionStatus } from "../../database/enum/permission.enum";

const casherDetailsSchema = z.object({
  status: z.nativeEnum(PermissionStatus).default(PermissionStatus.Pemitted),
  admin_id:z.number()
});

export const casherSchema = z.object({
  casher: casherDetailsSchema,
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"), 
  username: z.string().min(4, "Username must be at least 4 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirm_password: z.string().min(8, "Confirm password must be at least 8 characters"),
}).refine(data => data.password === data.confirm_password, {
  message: "Passwords don't match",
  path: ["confirm_password"],
});

export const updateCasherSchema = z.object({
  casher: casherDetailsSchema.partial().optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  username: z.string().min(4).optional(),
  phone:z.string().trim().min(9).max(13).refine((value)=>{
    const regex=/^(09\d{8}|07\d{8}|9\d{8}|7\d{8}|\+2517\d{8}|\+2519\d{8})$/;
    return regex.test(value);
},{
    message:"invalid phone number format"
}).optional(),
password: z.string().min(8).optional(),
confirm_password: z.string().optional(),
})
.refine((data) => !data.password || data.password === data.confirm_password, {
message: "Passwords do not match",
path: ["confirm_password"],
})