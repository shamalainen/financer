import { Router } from "express";
import { addIncome, listUserIncomes } from "../controllers/income-controller";
import {
  deleteTransaction,
  getTransaction,
} from "../controllers/transaction-controller";

const router = Router();

router.get("/", listUserIncomes);

router.post("/", addIncome);

router.get("/:id", getTransaction);

router.delete("/:id", deleteTransaction);

router.get("/:id", getTransaction);

router.delete("/:id", deleteTransaction);

export default router;
