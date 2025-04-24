export interface ResponseData<T> {
  payload: T;
}

export interface ResponseBody<T> {
  status: "success" | "fail" | "error";
  message: string;
  data: ResponseData<T>;
}



export const createResponse = <T>(
  status: "success" | "fail" | "error",
  message: string,
  payload: T
): ResponseBody<T> => {
  return {
    status,
    message,
    data: {
      payload,
    },
  };
};
