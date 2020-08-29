import express from "express";
import accountsController from "../controllers/accountsController.js";

const router = express.Router();

router.get("/accounts", accountsController.findAll);
router.post("/saldo", accountsController.findOne);
router.post("/mediaSaldo", accountsController.mediaSaldo);
router.post("/menoresSaldos", accountsController.menoresSaldos);
router.post("/maioresSaldos", accountsController.maioresSaldos);
router.put("/account/transfer/:ido", accountsController.transfer);
router.put("/deposito", accountsController.deposito);
router.put("/privateTransfer", accountsController.privateTransfer);
router.put("/saque", accountsController.saque);
router.delete("/delete", accountsController.deleteAccount);
router.delete("/deleteAll", accountsController.deleteAll);

export { router };
