import { Router } from "express";
import {
  addExpense,
  listUserExpenses,
} from "../controllers/expense-controller";
import {
  getTransaction,
  deleteTransaction,
} from "../controllers/transaction-controller";

const router = Router();

router.get("/", listUserExpenses);

router.post("/", addExpense);

router.get("/:id", getTransaction);

router.delete("/:id", deleteTransaction);

router.get("/:id", getTransaction);

router.delete("/:id", deleteTransaction);

export default router;
