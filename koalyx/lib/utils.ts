import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safely parses an integer value, returning null if the value is invalid
 * @param value - The value to parse
 * @param defaultValue - Default value to return if parsing fails
 * @returns The parsed integer or the default value
 */
export function safeParseInt(value: string | null | undefined, defaultValue: number | null = null): number | null {
  if (value === null || value === undefined) {
    return defaultValue
  }
  
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

/**
 * Safely parses an integer value, throwing an error if the value is invalid
 * @param value - The value to parse
 * @param errorMessage - Custom error message
 * @returns The parsed integer
 * @throws Error if the value cannot be parsed
 */
export function safeParseIntRequired(value: string | null | undefined, errorMessage: string = 'Invalid integer value'): number {
  const parsed = safeParseInt(value)
  if (parsed === null) {
    throw new Error(errorMessage)
  }
  return parsed
}
