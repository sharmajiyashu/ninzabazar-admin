/** Default app port for local and server runs. Override with PORT in .env */
export const APP_PORT = Number(process.env.PORT ?? 6001);

export const APP_HOST = process.env.APP_HOST ?? 'localhost';

export function getAppOrigin(host = APP_HOST): string {
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '');
  }

  const protocol = process.env.APP_PROTOCOL ?? 'http';
  return `${protocol}://${host}:${APP_PORT}`;
}
