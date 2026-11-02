export interface PayloadJwt {
  sub: number;
  username: string;
  iat?: number;
  exp?: number;
}