// Error status and message
export class AppError extends Error {
  status: "fail" | "error";
  code: number;

  constructor(code: number, message: string) {
    super(message);

    this.code = code;
    this.status = `${code}`.startsWith("4") ? "fail" : "error";

    Object.setPrototypeOf(this, AppError.prototype);
  }
}
