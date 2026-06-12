export const getCookieOptions = (expiresInDays = 7) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isCrossOrigin = process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost');
  const useSecure = isProduction || isCrossOrigin;

  return {
    secure: !!useSecure,
    httpOnly: true,
    sameSite: useSecure ? 'none' : 'lax',
    maxAge: expiresInDays * 24 * 60 * 60 * 1000,
  };
};

export const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isCrossOrigin = process.env.FRONTEND_URL && !process.env.FRONTEND_URL.includes('localhost');
  const useSecure = isProduction || isCrossOrigin;

  return {
    secure: !!useSecure,
    httpOnly: true,
    sameSite: useSecure ? 'none' : 'lax',
  };
};