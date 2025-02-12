import { Static, Type } from "@sinclair/typebox";
import { Role } from "./Role";

export const User = Type.Object({
  id: Type.Number(),
  createdAt: Type.Optional(Type.String()),
  email: Type.String(),
  weight: Type.Optional(Type.Number()),
  is18: Type.Optional(Type.Boolean()),
  name: Type.Optional(Type.String()),
  successorId: Type.Optional(Type.Number()),
  role: Type.Optional(Role),
  keywords: Type.Array(Type.String()),
  biography: Type.String(),
  decimal: Type.Number(),
  biginteger: Type.Integer(),
});

export type UserType = Static<typeof User>;
