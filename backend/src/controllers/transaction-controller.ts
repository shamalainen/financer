import { Response, Request, NextFunction } from "express";
import { ITransactionModel } from "../models/transaction-model";

import { IUserModel } from "../models/user-model";
import { findAccountById } from "../services/account-service";
import { deleteTransactionCategoryMappingByTransaction } from "../services/transaction-category-mapping-service";
import {
  createTransaction,
  findTransactionById,
  findTransactionsAfterByAccount,
  findTransferTransactionsByUser,
  increaseAccountTransactionBalanceAfterTargetDate,
} from "../services/transaction-service";

export const getTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
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

export const deleteTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
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
    const fromAccount = await findAccountById(transaction.fromAccount);
    if (fromAccount !== null) {
      fromAccount.balance += transaction.amount;
      await fromAccount.save();
      await increaseAccountTransactionBalanceAfterTargetDate(
        transaction.fromAccount,
        new Date(transaction.date),
        transaction.amount
      );
    }
  }
  if (transaction.toAccount) {
    const toAccount = await findAccountById(transaction.toAccount);
    if (toAccount !== null) {
      toAccount.balance -= transaction.amount;
      await toAccount.save();
      await increaseAccountTransactionBalanceAfterTargetDate(
        transaction.toAccount,
        new Date(transaction.date),
        -transaction.amount
      );
    }
  }

  await transaction.remove();
  await deleteTransactionCategoryMappingByTransaction(transactionId);

  res.status(200).json({ authenticated: true, status: 200 });
};

export const addTransfer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    sourceAccount = await findAccountById(rawNewTransaction.fromAccount);
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
    targetAccount = await findAccountById(rawNewTransaction.toAccount);
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

  next();
};

export const addTransaction = async (
  req: Request,
  res: Response
): Promise<void> => {
  const getAccountTotalAmountAfterDate = async (
    accountId: string,
    date: Date
  ): Promise<number> =>
    (await findTransactionsAfterByAccount(accountId, date))?.reduce(
      (prev, { toAccount, amount }) => {
        const currentAmount =
          typeof toAccount !== "undefined" &&
          toAccount?.toString() === accountId?.toString()
            ? -amount
            : amount;
        return prev + currentAmount;
      },
      0
    ) || 0;

  const user = req.user as IUserModel;
  const rawNewTransaction = req.body as ITransactionModel;

  let sourceAccount;
  let targetAccount;
  if (rawNewTransaction.fromAccount) {
    sourceAccount = await findAccountById(rawNewTransaction.fromAccount);
  }
  if (rawNewTransaction.toAccount) {
    targetAccount = await findAccountById(rawNewTransaction.toAccount);
  }

  let fromAccountTotalIncomeAfter = 0;
  if (rawNewTransaction.fromAccount) {
    await increaseAccountTransactionBalanceAfterTargetDate(
      rawNewTransaction.fromAccount,
      new Date(rawNewTransaction.date),
      -rawNewTransaction.amount
    );
    fromAccountTotalIncomeAfter = await getAccountTotalAmountAfterDate(
      rawNewTransaction.fromAccount,
      new Date(rawNewTransaction.date)
    );
  }

  let toAccountTotalIncomeAfter = 0;
  if (rawNewTransaction.toAccount) {
    await increaseAccountTransactionBalanceAfterTargetDate(
      rawNewTransaction.toAccount,
      new Date(rawNewTransaction.date),
      rawNewTransaction.amount
    );
    toAccountTotalIncomeAfter = await getAccountTotalAmountAfterDate(
      rawNewTransaction.toAccount,
      new Date(rawNewTransaction.date)
    );
  }

  rawNewTransaction.user = user.id;
  rawNewTransaction.fromAccountBalance =
    (sourceAccount?.balance || 0) + fromAccountTotalIncomeAfter;

  rawNewTransaction.toAccountBalance =
    (targetAccount?.balance || 0) + toAccountTotalIncomeAfter;

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

export const getTransfers = async (
  req: Request,
  res: Response
): Promise<void> => {
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
