import { Response, Request } from "express";
import { ITransactionModel } from "../models/transaction-model";

import { IUserModel } from "../models/user-model";
import { findAccountsById } from "../services/account-service";
import {
  createTransaction,
  findTransactionById,
  findTransferTransactionsByUser,
} from "../services/transaction-service";

export const getTransaction = async (req: Request, res: Response) => {
  const user = req.user as IUserModel;
  const transactionId = req.params.id;
  const transaction = await findTransactionById(transactionId);

  if (transaction === null) {
    res.status(404).json({
      authenticated: true,
      status: 404,
      errors: ["Transaction not found."],
    });
    return;
  }
  if (`${transaction?.user}` !== `${user._id}`) {
    res.status(403).json({
      authenticated: true,
      status: 403,
      errors: ["Not authorized to view that transaction."],
    });
    return;
  }
  res
    .status(200)
    .json({ authenticated: true, status: 200, payload: transaction });
};

export const deleteTransaction = async (req: Request, res: Response) => {
  const user = req.user as IUserModel;
  const transactionId = req.params.id;
  const transaction = await findTransactionById(transactionId);

  if (transaction === null) {
    res.status(404).json({
      authenticated: true,
      status: 404,
      errors: ["Transaction not found."],
    });
    return;
  }
  if (`${transaction?.user}` !== `${user._id}`) {
    res.status(403).json({
      authenticated: true,
      status: 403,
      errors: ["Not authorized to view that transaction."],
    });
    return;
  }

  if (transaction.fromAccount) {
    const fromAccount = await findAccountsById(transaction.fromAccount);
    if (fromAccount !== null) {
      fromAccount.balance += transaction.amount;
      await fromAccount.save();
    }
  }
  if (transaction.toAccount) {
    const toAccount = await findAccountsById(transaction.toAccount);
    if (toAccount !== null) {
      toAccount.balance -= transaction.amount;
      await toAccount.save();
    }
  }

  await transaction.remove();

  res.status(200).json({ authenticated: true, status: 200 });
};

export const addTransaction = async (req: Request, res: Response) => {
  const user = req.user as IUserModel;
  const rawNewTransaction = req.body as ITransactionModel;

  const errors: string[] = [];

  if (
    !("amount" in rawNewTransaction) ||
    typeof rawNewTransaction.amount !== "number"
  ) {
    errors.push("Amount must be a number.");
  }
  if (new Date(rawNewTransaction.date).toDateString() === "Invalid Date") {
    errors.push("Date must not be empty.");
  }

  let sourceAccount;
  let targetAccount;
  if (
    !rawNewTransaction.fromAccount ||
    rawNewTransaction.fromAccount.length === 0
  ) {
    errors.push("fromAccount must not be empty.");
  } else {
    sourceAccount = await findAccountsById(rawNewTransaction.fromAccount);
    if (sourceAccount === null) {
      errors.push("Source account not found.");
    } else if (`${sourceAccount?.owner}` !== `${user.id}`) {
      errors.push("You can transfer only from your own account.");
    }
  }
  if (
    !rawNewTransaction.toAccount ||
    rawNewTransaction.toAccount.length === 0
  ) {
    errors.push("toAccount must not be empty.");
  } else {
    targetAccount = await findAccountsById(rawNewTransaction.toAccount);
    if (targetAccount === null) {
      errors.push("Target account not found.");
    } else if (`${targetAccount?.owner}` !== `${user.id}`) {
      errors.push("You can transfer only to your own account.");
    }
  }

  if (rawNewTransaction.toAccount === rawNewTransaction.fromAccount) {
    errors.push("Target and source accounts can't be the same account.");
  }

  if (errors.length > 0) {
    res.status(400).json({ authorized: true, status: 400, errors });
    return;
  }

  rawNewTransaction.user = user.id;
  rawNewTransaction.fromAccountBalance = sourceAccount?.balance;
  rawNewTransaction.toAccountBalance = targetAccount?.balance;

  if (sourceAccount) {
    sourceAccount.balance -= rawNewTransaction.amount;
    await sourceAccount.save();
  }
  if (targetAccount) {
    targetAccount.balance += rawNewTransaction.amount;
    await targetAccount.save();
  }

  const newTransaction = await createTransaction(rawNewTransaction);

  res
    .status(201)
    .json({ authorized: true, status: 201, payload: newTransaction });
};

export const getTransfers = async (req: Request, res: Response) => {
  const user = req.user as IUserModel;
  const transfers = await findTransferTransactionsByUser(user.id);

  if (transfers === null) {
    res.status(404).json({
      authenticated: true,
      status: 404,
      errors: ["Transaction not found."],
    });
    return;
  }
  res
    .status(200)
    .json({ authenticated: true, status: 200, payload: transfers });
};
