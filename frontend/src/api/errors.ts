import { isAxiosError } from 'axios';

export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object') {
      const validation = Object.values(data.errors ?? {}).flat().find(value => typeof value === 'string');
      if (typeof validation === 'string') return validation;
      for (const key of ['email', 'password', 'message', 'error']) {
        if (typeof data[key] === 'string') return data[key];
      }
    }
  }
  return fallback;
}
