import { AccountDto, TransactionDto } from '@local/types';

import {
  getAllTransaction,
  getAccount,
  MINUTE_IN_MS,
  formatDate,
  getAccountFromTransactions,
  roundToTwoDecimal,
  getAllIncomes,
} from '$utils/api-helper';
import { test, expect } from '$utils/financer-page';
import { applyFixture } from '$utils/load-fixtures';

test.describe('Add income', () => {
  test.beforeEach(async ({ page }) => {
    await applyFixture('large');
    await page.goto('/statistics/incomes');
  });

  const newTransactionAmountStr = '15.50';
  const newTransactionAmount = parseFloat(newTransactionAmountStr);
  const getNewTransactionName = () =>
    `new dummy transaction created by test code ${Math.random()}`;

  const verifyAccountBalanceChange = async (
    amount: number,
    accountBefore: AccountDto,
    accountAfter: AccountDto,
  ) => {
    expect(roundToTwoDecimal(accountBefore.balance + amount)).toEqual(
      roundToTwoDecimal(accountAfter.balance),
    );
  };

  const verifyNewIncomeCreated = async (
    incomesBefore: TransactionDto[],
    incomesAfter: TransactionDto[],
  ) => {
    expect(incomesBefore.length + 1).toEqual(
      roundToTwoDecimal(incomesAfter.length),
    );
  };

  // eslint-disable-next-line playwright/expect-expect
  test('Add newest income', async ({ page }) => {
    const newTransactionName = getNewTransactionName();

    const transactionsBefore = await getAllTransaction();
    const incomesBefore = await getAllIncomes();

    const targetTransactionBefore = transactionsBefore.at(-1);

    const targetAccountId = getAccountFromTransactions(targetTransactionBefore);

    const accountBefore = await getAccount(targetAccountId);

    const newTransactionDate = new Date(
      targetTransactionBefore.dateObj.getTime() + MINUTE_IN_MS,
    );

    await page.getByTestId('add-income').click();
    await page.locator('#description').fill(newTransactionName);
    await page.locator('#date').fill(formatDate(newTransactionDate));
    await page.locator('#amount').fill(newTransactionAmountStr);
    await page.locator('#toAccount').selectOption(targetAccountId);

    await page.getByTestId('submit').click();

    await page.getByTestId('edit-income-button').waitFor();

    const accountAfter = await getAccount(targetAccountId);
    const incomesAfter = await getAllIncomes();

    await verifyAccountBalanceChange(
      newTransactionAmount,
      accountBefore,
      accountAfter,
    );
    await verifyNewIncomeCreated(incomesBefore, incomesAfter);
  });

  // eslint-disable-next-line playwright/expect-expect
  test('Add second newest income', async ({ page }) => {
    const newTransactionName = getNewTransactionName();

    const transactionsBefore = await getAllTransaction();
    const incomesBefore = await getAllIncomes();

    const targetTransactionBefore = transactionsBefore.at(-1);
    const targetAccountId = getAccountFromTransactions(targetTransactionBefore);

    const newTransactionDate = new Date(
      targetTransactionBefore.dateObj.getTime() - MINUTE_IN_MS,
    );

    const accountBefore = await getAccount(targetAccountId);

    await page.getByTestId('add-income').click();
    await page.locator('#description').fill(newTransactionName);
    await page.locator('#date').fill(formatDate(newTransactionDate));
    await page.locator('#amount').fill(newTransactionAmountStr);
    await page.locator('#toAccount').selectOption(targetAccountId);

    await page.getByTestId('submit').click();

    await page.getByTestId('edit-income-button').waitFor();

    const accountAfter = await getAccount(targetAccountId);
    const incomesAfter = await getAllIncomes();

    await verifyAccountBalanceChange(
      newTransactionAmount,
      accountBefore,
      accountAfter,
    );
    await verifyNewIncomeCreated(incomesBefore, incomesAfter);
  });

  // eslint-disable-next-line playwright/expect-expect
  test('Add oldest income', async ({ page }) => {
    const newTransactionName = getNewTransactionName();

    const transactionsBefore = await getAllTransaction();
    const incomesBefore = await getAllIncomes();

    const targetTransactionBefore = transactionsBefore.at(0);

    const targetAccountId = getAccountFromTransactions(targetTransactionBefore);

    const newTransactionDate = new Date(
      targetTransactionBefore.dateObj.getTime() - MINUTE_IN_MS,
    );

    const accountBefore = await getAccount(targetAccountId);

    await page.getByTestId('add-income').click();
    await page.locator('#description').fill(newTransactionName);
    await page.locator('#date').fill(formatDate(newTransactionDate));
    await page.locator('#amount').fill(newTransactionAmountStr);
    await page.locator('#toAccount').selectOption(targetAccountId);

    await page.getByTestId('submit').click();

    await page.getByTestId('edit-income-button').waitFor();

    const accountAfter = await getAccount(targetAccountId);
    const incomesAfter = await getAllIncomes();

    await verifyAccountBalanceChange(
      newTransactionAmount,
      accountBefore,
      accountAfter,
    );
    await verifyNewIncomeCreated(incomesBefore, incomesAfter);
  });

  test('Check that date is correct', async ({ page }) => {
    const newTransactionName = getNewTransactionName();

    const transactionsBefore = await getAllTransaction();
    const targetTransactionBefore = transactionsBefore.at(-1);
    const targetAccountId = getAccountFromTransactions(targetTransactionBefore);

    const date = new Date();
    date.setSeconds(0);
    date.setMilliseconds(0);

    await page.getByTestId('add-income').click();
    await page.locator('#description').fill(newTransactionName);
    await page.locator('#date').fill(formatDate(date));
    await page.locator('#amount').fill(newTransactionAmountStr);
    await page.locator('#toAccount').selectOption(targetAccountId);

    await page.getByTestId('submit').click();

    await page.getByText(newTransactionName).click();
    await page.getByTestId('edit-income-button').click();

    const inputValue = await page.locator('#date').inputValue();
    expect(date.toISOString()).toEqual(new Date(inputValue).toISOString());
  });
});
