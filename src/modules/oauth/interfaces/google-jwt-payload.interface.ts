export interface GoogleJwtPayload {
  sub: string;
  hd?: string;
  aud: string;
  iat: number;
  exp: number;
  name: string;
  email: string;
  picture: string;
  email_verified: boolean;
}
