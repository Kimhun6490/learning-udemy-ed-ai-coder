export const AUTH_USER = "user";
export const AUTH_PASSWORD = "password";
export const AUTH_STORAGE_KEY = "pm-authenticated";

export const validateCredentials = (username: string, password: string): boolean => {
  return username.trim() === AUTH_USER && password === AUTH_PASSWORD;
};
