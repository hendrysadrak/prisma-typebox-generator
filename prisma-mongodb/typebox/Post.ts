import {Type, Static} from "@sinclair/typebox"
import { UserStatus } from './UserStatus'
import { StatusHistory } from './StatusHistory'
import { Role } from './Role'

export const Post = Type.Object({
	
id: Type.String()
,User: Type.Optional( Type.Object({
	
id: Type.String()
,createdAt: Type.Optional( Type.String() )
,email: Type.String()
,weight: Type.Optional( Type.Number() )
,is18: Type.Optional( Type.Boolean() )
,name: Type.Optional( Type.String() )
,successorId: Type.Optional( Type.Number() )
,role: Type.Optional( Role )
,keywords: Type.Array( Type.String() )
,biography: Type.String()
,biginteger: Type.Integer()
,statusHistory: Type.Array( ::StatusHistory:: )

}) )
,userId: Type.Optional( Type.String() )

})

export type PostType = Static<typeof Post>