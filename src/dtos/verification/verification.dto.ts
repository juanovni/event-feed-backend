import { email, z } from "zod";

export const SendVerificationCodeDto = z.object({
  //userId: z.string().uuid(),
  email: z.string().email("Correo electrónico inválido"),
});

export const VerifyCodeDto = z.object({
  //  userId: z.string().uuid(),
  email: z.string().email("Correo electrónico inválido"),
  code: z.string().length(4, "El código debe tener 4 dígitos"),
});
/* 
export type SendVerificationCodeInput = z.infer<typeof SendVerificationCodeDto>; */
export type VerifyCodeInput = z.infer<typeof VerifyCodeDto>;