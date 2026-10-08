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

import { ZodError } from "zod";

export function formatApiError(error: any): ApiResponse {
  if (error instanceof AppError) {
    return {
      status: error.status,
      message: error.message,
      errors: error.errors,
    };
  }

  if (error instanceof ZodError || error?.name === "ZodError") {
    const issue = error.issues?.[0];
    const message = issue ? issue.message : "Validation failed.";
    const errors = error.issues?.map((i: any) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return {
      status: 400,
      message,
      errors,
    };
  }

  return {
    status: 500,
    message: error?.message || "An unexpected system error occurred. Please try again later.",
  };
}
