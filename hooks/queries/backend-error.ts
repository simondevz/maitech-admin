import type { BackendError, BackendResult } from "@/lib/backend/types";

export class BackendQueryError extends Error {
  code: string;
  hint?: string;
  status: number;

  constructor(error: BackendError) {
    super(error.message);
    this.name = "BackendQueryError";
    this.code = error.code;
    this.hint = error.hint;
    this.status = error.status;
  }
}

export async function unwrap<T>(promise: Promise<BackendResult<T>>): Promise<T> {
  const result = await promise;
  if (!result.ok) throw new BackendQueryError(result.error);
  return result.data;
}
