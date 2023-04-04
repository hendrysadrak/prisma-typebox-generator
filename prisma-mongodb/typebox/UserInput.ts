import { Static, Type } from "@sinclair/typebox";
import { Role } from "./Role";
import { StatusHistory } from "./StatusHistory";
import { UserStatus } from "./UserStatus";

export const UserInput = Type.Object({
  id: Type.String(),
  createdAt: Type.Optional(Type.String()),
  email: Type.String(),
  weight: Type.Optional(Type.Number()),
  is18: Type.Optional(Type.Boolean()),
  name: Type.Optional(Type.String()),
  successorId: Type.Optional(Type.Number()),
  role: Type.Optional(Role),
  posts: Type.Array(
    Type.Object({
      id: Type.String(),
      userId: Type.Optional(Type.String()),
    })
  ),
  keywords: Type.Array(Type.String()),
  biography: Type.String(),
  biginteger: Type.Integer(),
  status: Type.Optional(UserStatus),
  statusHistory: Type.Array(StatusHistory),
});

export type UserInputType = Static<typeof UserInput>;
