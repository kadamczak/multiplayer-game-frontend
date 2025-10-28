import type { FieldValues, UseFormSetError } from "react-hook-form"

export const applyServerFieldErrors = <TFieldValues extends FieldValues = Record<string, any>>(
  setError: UseFormSetError<TFieldValues>,
  fieldErrors?: Record<string, string>
) => {
  if (!fieldErrors) return;
  
  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError(field as any, { type: 'server', message })
  });
}