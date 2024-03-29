import { submitTransactionCategoryForm } from '$utils/api-helper';
import { test, expect } from '$utils/financer-page';
import { applyFixture } from '$utils/load-fixtures';

test.describe('Edit transfer with category', () => {
  const ids = {
    transferWithSingleCategory: '623de2a0c839cf72d59b0df2',
    transferWithMultipleCategories: '623de2c0c839cf72d59b0e10',
    editTransferButton: 'edit-transfer-button',
    transactionCategoriesForm: 'transaction-categories-form',
    transactionCategoriesItem: 'transaction-categories-item',
  };

  test.beforeEach(async ({ page }) => {
    await applyFixture('small');
    await page.goto('/statistics/transfers?date=2022-03&page=1');
  });

  test('Edit with single category', async ({ page }) => {
    await page.getByTestId(ids.transferWithSingleCategory).click();
    await page.getByTestId(ids.editTransferButton).click();

    await page.getByRole('button', { name: 'Edit category' }).click();
    await page.waitForTimeout(100);

    const select = page.getByTestId(`${ids.transactionCategoriesForm}-select`);
    const amount = page.getByTestId(`${ids.transactionCategoriesForm}-amount`);
    const description = page.getByTestId(
      `${ids.transactionCategoriesForm}-description`,
    );

    await expect(select.locator('option:checked')).toContainText(
      'Invisible category > Transfer sub category',
    );
    await expect(amount).toHaveValue('3333');
    await expect(description).toHaveValue('dummy description');

    await submitTransactionCategoryForm(ids.transactionCategoriesForm, page, {
      select: 'Invisible category > Sub category for all types',
      amount: '50.50',
    });

    await page.waitForTimeout(100);

    await page.getByTestId('submit').click();

    await page.goto('/statistics/transfers?date=2022-03&page=1');
    await page.getByTestId(ids.transferWithSingleCategory).click();
    await page.getByTestId(ids.editTransferButton).click();

    await page.getByRole('button', { name: 'Edit category' }).click();
    await page.waitForTimeout(100);

    await expect(select.locator('option:checked')).toContainText(
      'Invisible category > Sub category for all types',
    );
    await expect(amount).toHaveValue('50.5');
    await expect(description).toHaveValue('');
  });

  test('Delete one categories with multiple categories', async ({ page }) => {
    await page.getByTestId(ids.transferWithMultipleCategories).click();
    await page.getByTestId(ids.editTransferButton).click();

    const item = page.getByTestId(ids.transactionCategoriesItem);
    const name = page.getByTestId(`${ids.transactionCategoriesItem}-name`);
    const amount = page.getByTestId(`${ids.transactionCategoriesItem}-amount`);
    const description = page.getByTestId(
      `${ids.transactionCategoriesItem}-description`,
    );

    await expect(name.first()).toContainText(
      'Invisible category > Sub category for all types',
    );
    await expect(name.nth(1)).toContainText('Transfer category');

    await expect(amount.first()).toContainText('333333');
    await expect(amount.nth(1)).toContainText('3333');

    await expect(description.first()).toContainText('dummy description');
    await expect(description.nth(1)).toContainText('not so dummy description');

    await page.getByRole('button', { name: 'Edit category' }).first().click();
    await page.waitForTimeout(100);

    await submitTransactionCategoryForm(ids.transactionCategoriesForm, page, {
      amount: '100',
      description: 'Changed description',
    });

    await expect(item).toHaveCount(2);

    await page.getByRole('button', { name: 'Edit category' }).last().click();
    await page.waitForTimeout(100);

    await page.getByTestId(`${ids.transactionCategoriesForm}-delete`).click();

    await expect(item).toHaveCount(1);

    await page.getByTestId('submit').click();

    await page.goto('/statistics/transfers?date=2022-03&page=1');
    await page.getByTestId(ids.transferWithMultipleCategories).click();
    await page.getByTestId(ids.editTransferButton).click();

    await expect(item).toHaveCount(1);
    await expect(name).toHaveText(
      'Invisible category > Sub category for all types',
    );
    await expect(amount).toHaveText('100');
    await expect(description).toHaveText('Changed description');
  });

  test('Delete all categories with multiple categories', async ({ page }) => {
    await page.getByTestId(ids.transferWithMultipleCategories).click();
    await page.getByTestId(ids.editTransferButton).click();

    const item = page.getByTestId(ids.transactionCategoriesItem);
    await expect(item).toHaveCount(2);

    await page.getByRole('button', { name: 'Edit category' }).first().click();
    await page.waitForTimeout(100);
    await page.getByTestId(`${ids.transactionCategoriesForm}-delete`).click();

    await page.waitForTimeout(100);

    await page.getByRole('button', { name: 'Edit category' }).first().click();
    await page.waitForTimeout(100);
    await page.getByTestId(`${ids.transactionCategoriesForm}-delete`).click();

    await expect(item).toHaveCount(0);

    await page.getByTestId('submit').click();

    await page.goto('/statistics/transfers?date=2022-03&page=1');
    await page.getByTestId(ids.transferWithMultipleCategories).click();
    await page.getByTestId(ids.editTransferButton).click();

    await expect(item).toHaveCount(0);
  });
});
