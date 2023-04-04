import { Static, Type } from "@sinclair/typebox";
import { UserStatus } from "./UserStatus";

export const StatusHistoryInput = Type.Object({
  fromStatus: UserStatus,
  toStatus: UserStatus,
  date: Type.String(),
});

export type StatusHistoryInputType = Static<typeof StatusHistoryInput>;
