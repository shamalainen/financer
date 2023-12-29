import { AccountDto } from '@local/types';

import {
  getAllTransaction,
  getAccount,
  getTransactionById,
  ITransactionWithDateObject,
  roundToTwoDecimal,
} from '$utils/api-helper';
import { test, expect } from '$utils/financer-page';
import { applyFixture } from '$utils/load-fixtures';

test.describe('Edit transfer', () => {
  test.beforeEach(async ({ page }) => {
    await applyFixture('large');
    await page.goto('/statistics/transfers');
  });

  const amountToChangeTransactionStr = '15.50';
  const amountToChangeTransaction = parseFloat(amountToChangeTransactionStr);
  const getEditedTransactionName = () =>
    `edited dummy transaction created by test code ${Math.random()}`;

  const verifyToAccountBalanceChanges = async (
    amount: number,
    accountBefore: AccountDto,
    accountAfter: AccountDto,
  ) => {
    const balanceBefore = roundToTwoDecimal(accountBefore.balance);
    const balanceAfter = roundToTwoDecimal(accountAfter.balance);

    expect(balanceBefore + amount).toEqual(balanceAfter);
  };

  const verifyFromAccountBalanceChanges = async (
    amount: number,
    accountBefore: AccountDto,
    accountAfter: AccountDto,
  ) => {
    const balanceBefore = roundToTwoDecimal(accountBefore.balance);
    const balanceAfter = roundToTwoDecimal(accountAfter.balance);

    expect(balanceBefore - amount).toEqual(balanceAfter);
  };

  const verifyTargetTransactionChanged = async (
    newName: string,
    changedAmount: number,
    transactionBefore: ITransactionWithDateObject,
    transactionAfter: ITransactionWithDateObject,
  ) => {
    const nameAfter = transactionAfter.description;
    const amountAfter = roundToTwoDecimal(transactionAfter.amount);

    const nameBefore = transactionBefore.description;
    const amountBefore = roundToTwoDecimal(transactionBefore.amount);

    expect(nameBefore).not.toEqual(newName);
    expect(nameAfter).toEqual(newName);
    expect(amountBefore + changedAmount).toEqual(amountAfter);
  };

  // eslint-disable-next-line playwright/expect-expect
  test('Edit newest transfer', async ({ page }) => {
    const editedTransactionName = getEditedTransactionName();
    const transactionsBefore = await getAllTransaction();

    const transfersBefore = transactionsBefore.filter(
      ({ fromAccount, toAccount }) => fromAccount && toAccount,
    );
    const targetTransactionBefore = transfersBefore[transfersBefore.length - 1];

    const targetTransactionId = targetTransactionBefore._id;
    const targetToAccountId = targetTransactionBefore.toAccount;
    const targetFromAccountId = targetTransactionBefore.fromAccount;

    const toAccountBefore = await getAccount(targetToAccountId);
    const fromAccountBefore = await getAccount(targetFromAccountId);

    const newAmount =
      targetTransactionBefore.amount + amountToChangeTransaction;

    await page.goto(`/statistics/transfers?date=2022-01&page=1`);

    await page.getByTestId(targetTransactionId).click();

    await page.getByTestId('edit-transfer-button').click();
    await page.locator('#description').fill(editedTransactionName);
    await page.locator('#amount').fill(newAmount.toString());

    await page.locator('#fromAccount').selectOption(targetFromAccountId);
    await page.locator('#toAccount').selectOption(targetToAccountId);

    await page.getByTestId('submit').click();

    await page.getByTestId('edit-transfer-button').waitFor();

    const toAccountAfter = await getAccount(targetToAccountId);
    const fromAccountAfter = await getAccount(targetFromAccountId);
    const targetTransactionAfter =
      await getTransactionById(targetTransactionId);

    await verifyToAccountBalanceChanges(
      amountToChangeTransaction,
      toAccountBefore,
      toAccountAfter,
    );
    await verifyFromAccountBalanceChanges(
      amountToChangeTransaction,
      fromAccountBefore,
      fromAccountAfter,
    );
    await verifyTargetTransactionChanged(
      editedTransactionName,
      amountToChangeTransaction,
      targetTransactionBefore,
      targetTransactionAfter,
    );
  });

  // eslint-disable-next-line playwright/expect-expect
  test('Edit oldest transfer', async ({ page }) => {
    const editedTransactionName = getEditedTransactionName();
    const transactionsBefore = await getAllTransaction();

    const transfersBefore = transactionsBefore.filter(
      ({ fromAccount, toAccount }) => fromAccount && toAccount,
    );
    const targetTransactionBefore = transfersBefore[0];

    const targetTransactionId = targetTransactionBefore._id;
    const targetToAccountId = targetTransactionBefore.toAccount;
    const targetFromAccountId = targetTransactionBefore.fromAccount;

    const toAccountBefore = await getAccount(targetToAccountId);
    const fromAccountBefore = await getAccount(targetFromAccountId);

    const newAmount =
      targetTransactionBefore.amount + amountToChangeTransaction;

    await page.goto(`/statistics/transfers?date=2021-02&page=1`);

    await page.getByTestId(targetTransactionId).click();

    await page.getByTestId('edit-transfer-button').click();
    await page.locator('#description').fill(editedTransactionName);
    await page.locator('#amount').fill(newAmount.toString());

    await page.getByTestId('submit').click();

    await page.getByTestId('edit-transfer-button').waitFor();

    const toAccountAfter = await getAccount(targetToAccountId);
    const fromAccountAfter = await getAccount(targetFromAccountId);
    const targetTransactionAfter =
      await getTransactionById(targetTransactionId);

    await verifyToAccountBalanceChanges(
      amountToChangeTransaction,
      toAccountBefore,
      toAccountAfter,
    );
    await verifyFromAccountBalanceChanges(
      amountToChangeTransaction,
      fromAccountBefore,
      fromAccountAfter,
    );
    await verifyTargetTransactionChanged(
      editedTransactionName,
      amountToChangeTransaction,
      targetTransactionBefore,
      targetTransactionAfter,
    );
  });
});
