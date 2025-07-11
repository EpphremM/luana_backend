"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTransactionSchema = exports.transactionSchema = exports.transactionStatusEnum = exports.transactionTypeEnum = void 0;
const zod_1 = require("zod");
const transaction_type_enum_1 = require("../../database/enum/transaction.type.enum");
exports.transactionTypeEnum = zod_1.z.nativeEnum(transaction_type_enum_1.transactionType);
exports.transactionStatusEnum = zod_1.z.nativeEnum(transaction_type_enum_1.transactionStatus);
exports.transactionSchema = zod_1.z.object({
    type: exports.transactionTypeEnum.optional(),
    amount_in_birr: zod_1.z.number().nonnegative("Amount in birr must be non-negative"),
    amount_in_package: zod_1.z.number().nonnegative("Amount in package must be non-negative"),
    status: exports.transactionStatusEnum.default(transaction_type_enum_1.transactionStatus.pending),
    sender_id: zod_1.z.string(),
    reciever_id: zod_1.z.string(),
    created_at: zod_1.z.date().optional()
});
exports.updateTransactionSchema = exports.transactionSchema.partial().refine(data => {
    return Object.keys(data).length > 0;
}, {
    message: "At least one field must be provided for update",
    path: ["update"]
});
