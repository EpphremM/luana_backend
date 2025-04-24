import { z } from "zod"
export const userSchema= z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    phone:z.string().trim().min(9).max(13).refine((value)=>{
      const regex=/^(09\d{8}|07\d{8}|9\d{8}|7\d{8}|\+2517\d{8}|\+2519\d{8})$/;
      return regex.test(value);
  },{
      message:"invalid phone number format"
  }),
    username: z.string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username cannot exceed 20 characters"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
  })