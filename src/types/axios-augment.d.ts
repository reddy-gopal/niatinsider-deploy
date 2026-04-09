import 'axios';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** If true, a 401 on this request does not trigger refresh/logout (optional auth / guests). */
    skipAuthRetry?: boolean;
  }
}
