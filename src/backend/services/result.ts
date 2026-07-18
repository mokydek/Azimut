// Shared discriminated result for every backend service.
// Callers narrow with `'error' in result`.
export type ServiceResult<T> = { data: T } | { error: string }
