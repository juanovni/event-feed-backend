import { Request, Response } from "express";
import * as verificationService from "../../services/verification/verification.service";
import { SendVerificationCodeDto, VerifyCodeDto } from "../../dtos/verification/verification.dto";

export const sendCodeController = async (req: Request, res: Response) => {
  try {
    const parsed = SendVerificationCodeDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", error: parsed.error });
    }

    const result = await verificationService.sendVerificationCode(parsed.data.email);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const verifyCodeController = async (req: Request, res: Response) => {
  try {
    const parsed = VerifyCodeDto.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Datos inválidos", error: parsed.error });
    }

    const result = await verificationService.verifyCode(parsed.data.email, parsed.data.code);
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};