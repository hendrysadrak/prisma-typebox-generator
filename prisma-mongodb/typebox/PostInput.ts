import { Static, Type } from "@sinclair/typebox";

export const PostInput = Type.Object({
  id: Type.String(),
  userId: Type.Optional(Type.String()),
});

export type PostInputType = Static<typeof PostInput>;
