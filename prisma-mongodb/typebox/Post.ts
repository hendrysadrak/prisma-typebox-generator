import { Static, Type } from "@sinclair/typebox";

export const Post = Type.Object({
  id: Type.String(),
  userId: Type.Optional(Type.String()),
});

export type PostType = Static<typeof Post>;
