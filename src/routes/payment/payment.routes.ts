import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { confirmPayment, preparePayment, quotePayment } from "../../services/payment/payment.service";

const router = Router();

router.post("/quote", authenticate, async (req, res) => {
  try {
    return res.json(await quotePayment(req.body.items));
  } catch (error) {
    console.error("Error calculando resumen:", error);
    return res.status(400).json({ message: "No se pudo calcular el resumen." });
  }
});

router.post("/prepare", authenticate, async (req, res) => {
  try {
    return res.status(201).json(await preparePayment(String(req.user!.id), req.body.items, req.body.expectedTotal, req.body.billingData, req.body.termsAccepted));
  } catch (error) {
    console.error("Error preparando pago:", error);
    return res.status(400).json({ message: "No se pudo preparar el pago." });
  }
});

router.post("/confirm", authenticate, async (req, res) => {
  try {
    return res.json(await confirmPayment(String(req.user!.id), req.body.id, req.body.clientTransactionId));
  } catch (error) {
    console.error("Error confirmando pago:", error);
    return res.status(400).json({ message: "No se pudo confirmar el pago." });
  }
});

export default router;
