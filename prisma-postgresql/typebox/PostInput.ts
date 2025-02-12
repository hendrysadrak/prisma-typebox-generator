import { Static, Type } from "@sinclair/typebox";

export const PostInput = Type.Object({
  id: Type.Optional(Type.Number()),
  userId: Type.Optional(Type.Number()),
});

export type PostInputType = Static<typeof PostInput>;
