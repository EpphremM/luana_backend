import { z } from "zod";
import { transactionStatus, transactionType } from "../../database/enum/transaction.type.enum";
export const transactionTypeEnum = z.nativeEnum(transactionType);
export const transactionStatusEnum = z.nativeEnum(transactionStatus);

export const transactionSchema = z.object({
  type: transactionTypeEnum.optional(), 
  amount_in_birr: z.number().nonnegative("Amount in birr must be non-negative"),
  amount_in_package: z.number().nonnegative("Amount in package must be non-negative"),
  status: transactionStatusEnum.default(transactionStatus.pending),
  sender_id: z.string(),
  reciever_id: z.string(),
  created_at: z.date().optional() 
});

export const updateTransactionSchema = transactionSchema.partial().refine(data => {
  return Object.keys(data).length > 0;
}, {
  message: "At least one field must be provided for update",
  path: ["update"]
});
