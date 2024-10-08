import { type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { type Register } from "@/type/user";
import { v4 as uuidv4 } from "uuid";
import {
  passwordValidator,
  phoneValidator,
  codeValidator,
} from "@/utils/validators";
import { createToken } from "@/utils/authorization";
export async function POST(req: NextRequest) {
  const prisma = new PrismaClient();
  try {
    const id = uuidv4();
    const body: Register = await req.json();
    const { phone, code, password } = body;
    // 格式校验
    await phoneValidator(phone);
    await passwordValidator(password);
    await codeValidator(code);
    // 手机号是否已注册
    const hasRegister = !!(await prisma.user_login.findFirst({
      where: {
        phone,
      },
    }));
    console.log(hasRegister);
    if (hasRegister) await Promise.reject("手机号已注册");
    await prisma.user_login.create({
      data: {
        id,
        phone,
        password,
      },
    });
    await prisma.user_basis.create({
      data: {
        id,
        phone,
        name: "未设置",
        avatarURL: "",
        gender: "男",
        age: 0,
        originalAddress: ["广东省", "深圳市", "大鹏新区"],
        currentAddress: ["广东省", "深圳市", "大鹏新区"],
        status: ["自由"],
        customTags: ["地球村民"],
        filterInfo: {},
        filterConds: ['gender', 'minAge', 'maxAge', 'originalAddress', 'currentAddress', 'status', 'customTags']
      },
    });
    await prisma.chat_list.create({
      data: {
        id,
        body: [],
      },
    });
    return Response.json({
      code: 200,
      message: "注册成功",
      data: {
        id,
        accessToken: await createToken({ id, type: "access" }),
        refreshToken: await createToken({ id, type: "refresh" }),
      },
    });
  } catch (e) {
    return Response.json({
      code: 400,
      message: e,
    });
  } finally {
    prisma.$disconnect();
  }
}
