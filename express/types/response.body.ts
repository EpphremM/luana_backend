export interface ResponseBody<T> {
    status: 'success' | 'fail' | 'error';
    message: string;
    data: {
      payload: T;
    };
  }
  