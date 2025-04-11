import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn(
    '⚠️ PRIVATE_JWT_SECRET não está definido nas variáveis de ambiente!',
  );
}

interface JWTPayload {
  uid: string;
  exp?: number;
  iat?: number;
  nome?: string;
  email: string;
}

export function verifyToken(token: string) {
  if (!JWT_SECRET) {
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return { valid: true, data: decoded as JWTPayload };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}
