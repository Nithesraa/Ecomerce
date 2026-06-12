export const getCookieOptions = (expiresInDays = 7) => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: expiresInDays * 24 * 60 * 60 * 1000,
  };
};

export const getClearCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    secure: isProduction,
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
  };
};