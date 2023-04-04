import { Static, Type } from "@sinclair/typebox";

export const UserStatusConst = {
  CREATED: Type.Literal("CREATED"),
  ACTIVE: Type.Literal("ACTIVE"),
  INACTIVE: Type.Literal("INACTIVE"),
};

export const UserStatus = Type.KeyOf(Type.Object(UserStatusConst));

export type UserStatusType = Static<typeof UserStatus>;
