import { AccountDto, TransactionDto } from '@local/types';

import {
  getAllTransaction,
  getAccount,
  MINUTE_IN_MS,
  formatDate,
  getAccountFromTransactions,
  roundToTwoDecimal,
  getAllExpenses,
} from '$utils/api-helper';
import { test, expect } from '$utils/financer-page';
import { applyFixture } from '$utils/load-fixtures';

test.describe('Add expense', () => {
  test.beforeEach(async ({ page }) => {
    await applyFixture('large');
    await page.goto('/statistics/expenses');
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
    expect(roundToTwoDecimal(accountBefore.balance - amount)).toEqual(
      roundToTwoDecimal(accountAfter.balance),
    );
  };

  const verifyNewExpenseCreated = async (
    expensesBefore: TransactionDto[],
    expensesAfter: TransactionDto[],
  ) => {
    expect(expensesBefore.length + 1).toEqual(
      roundToTwoDecimal(expensesAfter.length),
    );
  };

  // eslint-disable-next-line playwright/expect-expect
  test('Add newest expense', async ({ page }) => {
    const newTransactionName = getNewTransactionName();

    const transactionsBefore = await getAllTransaction();
    const expensesBefore = await getAllExpenses();

    const targetTransactionBefore = transactionsBefore.at(-1);

    const targetAccountId = getAccountFromTransactions(targetTransactionBefore);

    const accountBefore = await getAccount(targetAccountId);

    const newTransactionDate = new Date(
      targetTransactionBefore.dateObj.getTime() + MINUTE_IN_MS,
    );

    await page.getByTestId('add-expense').click();
    await page.locator('#description').fill(newTransactionName);
    await page.locator('#date').fill(formatDate(newTransactionDate));
    await page.locator('#amount').fill(newTransactionAmountStr);
    await page.locator('#fromAccount').selectOption(targetAccountId);

    await page.getByTestId('submit').click();

    await page.getByTestId('edit-expense-button').waitFor();

    const accountAfter = await getAccount(targetAccountId);

    const expensesAfter = await getAllExpenses();

    await verifyAccountBalanceChange(
      newTransactionAmount,
      accountBefore,
      accountAfter,
    );
    await verifyNewExpenseCreated(expensesBefore, expensesAfter);
  });

  // eslint-disable-next-line playwright/expect-expect
  test('Add second newest expense', async ({ page }) => {
    const newTransactionName = getNewTransactionName();

    const transactionsBefore = await getAllTransaction();
    const expensesBefore = await getAllExpenses();

    const targetTransactionBefore = transactionsBefore.at(-1);
    const targetAccountId = getAccountFromTransactions(targetTransactionBefore);

    const newTransactionDate = new Date(
      targetTransactionBefore.dateObj.getTime() - MINUTE_IN_MS,
    );

    const accountBefore = await getAccount(targetAccountId);

    await page.getByTestId('add-expense').click();
    await page.locator('#description').fill(newTransactionName);
    await page.locator('#date').fill(formatDate(newTransactionDate));
    await page.locator('#amount').fill(newTransactionAmountStr);
    await page.locator('#fromAccount').selectOption(targetAccountId);

    await page.getByTestId('submit').click();

    await page.getByTestId('edit-expense-button').waitFor();

    const accountAfter = await getAccount(targetAccountId);
    const expensesAfter = await getAllExpenses();

    await verifyAccountBalanceChange(
      newTransactionAmount,
      accountBefore,
      accountAfter,
    );
    await verifyNewExpenseCreated(expensesBefore, expensesAfter);
  });

  // eslint-disable-next-line playwright/expect-expect
  test('Add oldest expense', async ({ page }) => {
    const newTransactionName = getNewTransactionName();

    const transactionsBefore = await getAllTransaction();
    const expensesBefore = await getAllExpenses();

    const targetTransactionBefore = transactionsBefore.at(0);

    const targetAccountId = getAccountFromTransactions(targetTransactionBefore);

    const newTransactionDate = new Date(
      targetTransactionBefore.dateObj.getTime() - MINUTE_IN_MS,
    );

    const accountBefore = await getAccount(targetAccountId);

    await page.getByTestId('add-expense').click();
    await page.locator('#description').fill(newTransactionName);
    await page.locator('#date').fill(formatDate(newTransactionDate));
    await page.locator('#amount').fill(newTransactionAmountStr);
    await page.locator('#fromAccount').selectOption(targetAccountId);

    await page.getByTestId('submit').click();

    await page.getByTestId('edit-expense-button').waitFor();

    //   cy.location('pathname').should('not.contain', '/add').then(() => {
    const accountAfter = await getAccount(targetAccountId);
    const expensesAfter = await getAllExpenses();

    await verifyAccountBalanceChange(
      newTransactionAmount,
      accountBefore,
      accountAfter,
    );
    await verifyNewExpenseCreated(expensesBefore, expensesAfter);
  });

  test('Check that date is correct', async ({ page }) => {
    const newTransactionName = getNewTransactionName();

    const transactionsBefore = await getAllTransaction();
    const targetTransactionBefore = transactionsBefore.at(-1);
    const targetAccountId = getAccountFromTransactions(targetTransactionBefore);

    const date = new Date();
    date.setSeconds(0);
    date.setMilliseconds(0);

    await page.getByTestId('add-expense').click();
    await page.locator('#description').fill(newTransactionName);
    await page.locator('#date').fill(formatDate(date));
    await page.locator('#amount').fill(newTransactionAmountStr);
    await page.locator('#fromAccount').selectOption(targetAccountId);

    await page.getByTestId('submit').click();

    await page.getByText(newTransactionName).click();
    await page.getByTestId('edit-expense-button').click();

    const inputValue = await page.locator('#date').inputValue();
    expect(date.toISOString()).toEqual(new Date(inputValue).toISOString());
  });
});
