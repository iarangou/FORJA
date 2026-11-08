export type RoleId = number;

export interface PayloadJwt {
  sub: number;
  username: string;
  rol_id: RoleId;
  iat?: number;
  exp?: number;
}
