"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transactionStatus = exports.transactionType = void 0;
var transactionType;
(function (transactionType) {
    transactionType["sendPackage"] = "send_package";
    transactionType["recievePackage"] = "receive_package";
})(transactionType || (exports.transactionType = transactionType = {}));
var transactionStatus;
(function (transactionStatus) {
    transactionStatus["pending"] = "pending";
    transactionStatus["completed"] = "completed";
})(transactionStatus || (exports.transactionStatus = transactionStatus = {}));
