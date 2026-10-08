export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiResponse<T = any> {
  status: number;
  message: string;
  data?: T;
  errors?: ApiErrorDetail[];
}

export class AppError extends Error {
  public status: number;
  public errors?: ApiErrorDetail[];

  constructor(message: string, status: number = 400, errors?: ApiErrorDetail[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export function formatApiError(error: any): ApiResponse {
  if (error instanceof AppError) {
    return {
      status: error.status,
      message: error.message,
      errors: error.errors,
    };
  }
  return {
    status: 500,
    message: "An unexpected system error occurred. Please try again later.",
  };
}
