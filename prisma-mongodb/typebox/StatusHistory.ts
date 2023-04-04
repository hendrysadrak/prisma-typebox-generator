import { Static, Type } from "@sinclair/typebox";
import { UserStatus } from "./UserStatus";

export const StatusHistory = Type.Object({
  fromStatus: UserStatus,
  toStatus: UserStatus,
  date: Type.String(),
});

export type StatusHistoryType = Static<typeof StatusHistory>;
