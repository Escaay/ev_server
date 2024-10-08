import { type NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { verifyToken } from '@/utils/authorization'
// 没传userId就是请求自己的信息，直接从accessToken里面取
export async function POST(req: NextRequest) {
    const body = await req.json()
    const prisma = new PrismaClient()
    const {id} = body
    const row = await prisma.user_basis.findFirst({
        where: {
            id
        }
    })
    return Response.json({
        code: 200,
        data: row,
        message: '请求成功'
    })
}