export const getCookieOptions = (expiresInDays = 7) => {
  return {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
    maxAge: expiresInDays * 24 * 60 * 60 * 1000,
  };
};

export const getClearCookieOptions = () => {
  return {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'strict',
  };
};
