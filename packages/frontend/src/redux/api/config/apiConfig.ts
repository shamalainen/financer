import { financerApi } from '../generated/financerApi';

enum ApiTag {
  ACCOUNT = 'accounts',
  ACCOUNT_BALANCE = 'account-balance',
  AUTHENTICATION = 'authentication',
  USER = 'user',
  USER_PREFERENCE = 'user-preference',
  TRANSACTION_TEMPLATE = 'transaction-template',
  TRANSACTION = 'transaction',
  CATEGORY = 'category',
}

financerApi.enhanceEndpoints({
  addTagTypes: Object.values(ApiTag),
  endpoints: {
    //
    // Accounts
    //
    accountsFindAllByUser: {
      providesTags: (res) => [
        ApiTag.ACCOUNT,
        { type: ApiTag.ACCOUNT, id: 'LIST' },
        { type: ApiTag.ACCOUNT, id: `PAGE-${res?.currentPage}` },
        ...(res?.data.map(({ id }) => ({ type: ApiTag.ACCOUNT, id })) ?? []),
      ],
    },
    accountsFindOneById: {
      providesTags: (res) => [
        ApiTag.ACCOUNT,
        { type: ApiTag.ACCOUNT, id: res?.id },
      ],
    },
    accountsGetAccountBalanceHistory: {
      providesTags: (res, err, args) => [
        ApiTag.ACCOUNT,
        ApiTag.ACCOUNT_BALANCE,
        { type: ApiTag.ACCOUNT, id: args.id },
        { type: ApiTag.ACCOUNT_BALANCE, id: args.id },
      ],
    },
    accountsCreate: {
      invalidatesTags: [{ type: ApiTag.ACCOUNT, id: 'LIST' }],
    },
    accountsUpdate: {
      invalidatesTags: (res) => [{ type: ApiTag.ACCOUNT, id: res?.id }],
    },
    accountsRemove: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.ACCOUNT, id: args.id },
        { type: ApiTag.ACCOUNT, id: 'LIST' },
      ],
    },

    //
    // Authentication
    //
    authGetAuthenticationStatus: {
      providesTags: [ApiTag.AUTHENTICATION],
    },

    //
    // User
    //
    usersFindOwnUser: {
      providesTags: (res) => [
        ApiTag.USER,
        { type: ApiTag.USER, id: 'own' },
        { type: ApiTag.USER, id: res?.id },
      ],
    },
    usersOverrideAllOwnUserData: {
      invalidatesTags: [
        ApiTag.ACCOUNT,
        ApiTag.ACCOUNT_BALANCE,
        ApiTag.CATEGORY,
        ApiTag.TRANSACTION,
        ApiTag.TRANSACTION_TEMPLATE,
        ApiTag.USER,
        ApiTag.USER_PREFERENCE,
      ],
    },

    //
    // User Preferences
    //
    userPreferencesFindOne: {
      providesTags: (res) => [
        ApiTag.USER_PREFERENCE,
        { type: ApiTag.USER_PREFERENCE, id: res?.key },
      ],
    },
    userPreferencesUpdate: {
      invalidatesTags: (res) => [
        { type: ApiTag.USER_PREFERENCE, id: res?.key },
      ],
    },

    //
    // Transaction Templates
    //
    transactionTemplatesFindAllByUser: {
      providesTags: (res) => [
        ApiTag.TRANSACTION_TEMPLATE,
        { type: ApiTag.TRANSACTION_TEMPLATE, id: 'LIST' },
        { type: ApiTag.TRANSACTION_TEMPLATE, id: 'LIST' },
        ...(res?.map(({ id }) => ({
          type: ApiTag.TRANSACTION_TEMPLATE,
          id,
        })) ?? []),
      ],
    },
    transactionTemplatesFindAllManualTypeByUser: {
      providesTags: (res) => [
        ApiTag.TRANSACTION_TEMPLATE,
        { type: ApiTag.TRANSACTION_TEMPLATE, id: 'LIST' },
        { type: ApiTag.TRANSACTION_TEMPLATE, id: 'LIST-MANUAL' },
        ...(res?.map(({ id }) => ({
          type: ApiTag.TRANSACTION_TEMPLATE,
          id,
        })) ?? []),
      ],
    },
    transactionTemplatesFindOne: {
      providesTags: (res) => [
        ApiTag.TRANSACTION_TEMPLATE,
        { type: ApiTag.TRANSACTION_TEMPLATE, id: res?.id },
      ],
    },
    transactionTemplatesCreate: {
      invalidatesTags: [{ type: ApiTag.TRANSACTION_TEMPLATE, id: 'LIST' }],
    },
    transactionTemplatesUpdate: {
      invalidatesTags: (res) => [
        { type: ApiTag.TRANSACTION_TEMPLATE, id: res?.id },
      ],
    },
    transactionTemplatesRemove: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.TRANSACTION_TEMPLATE, id: args.id },
        { type: ApiTag.TRANSACTION_TEMPLATE, id: 'LIST' },
      ],
    },

    //
    // Expense
    //
    expensesFindAllByUser: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: 'LIST' },
        { type: ApiTag.TRANSACTION, id: 'EXPENSE-LIST' },
        { type: ApiTag.TRANSACTION, id: `PAGE-${res?.currentPage}` },
        ...(res?.data.map(({ id }) => ({
          type: ApiTag.TRANSACTION,
          id,
        })) ?? []),
      ],
    },
    expensesFindMonthlySummariesByuser: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.TRANSACTION, id: 'EXPENSE-SUMMARY' },
        ...(res?.map(({ id }) => ({
          type: ApiTag.TRANSACTION,
          id: JSON.stringify(id),
        })) ?? []),
      ],
    },
    expensesFindOne: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: res?.id },
      ],
    },
    expensesCreate: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.TRANSACTION, id: 'EXPENSE-LIST' },
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.ACCOUNT, id: args.createExpenseDto.fromAccount },
      ],
    },
    expensesUpdate: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.TRANSACTION, id: res?.id },
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.TRANSACTION, id: 'EXPENSE-LIST' },
        { type: ApiTag.ACCOUNT, id: args.updateExpenseDto.fromAccount },
        { type: ApiTag.ACCOUNT, id: res?.fromAccount },
      ],
    },
    expensesRemove: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.TRANSACTION, id: args.id },
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.TRANSACTION, id: 'EXPENSE-LIST' },
        ApiTag.ACCOUNT,
      ],
    },

    //
    // Income
    //
    incomesFindAllByUser: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: 'LIST' },
        { type: ApiTag.TRANSACTION, id: 'INCOME-LIST' },
        { type: ApiTag.TRANSACTION, id: `PAGE-${res?.currentPage}` },
        ...(res?.data.map(({ id }) => ({
          type: ApiTag.TRANSACTION,
          id,
        })) ?? []),
      ],
    },
    incomesFindMonthlySummariesByuser: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.TRANSACTION, id: 'INCOME-SUMMARY' },
        ...(res?.map(({ id }) => ({
          type: ApiTag.TRANSACTION,
          id: JSON.stringify(id),
        })) ?? []),
      ],
    },
    incomesFindOne: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: res?.id },
      ],
    },
    incomesCreate: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.TRANSACTION, id: 'INCOME-LIST' },
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.ACCOUNT, id: args.createIncomeDto.toAccount },
      ],
    },
    incomesUpdate: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.TRANSACTION, id: res?.id },
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.TRANSACTION, id: 'INCOME-LIST' },
        { type: ApiTag.ACCOUNT, id: args.updateIncomeDto.toAccount },
        { type: ApiTag.ACCOUNT, id: res?.toAccount },
      ],
    },
    incomesRemove: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.TRANSACTION, id: args.id },
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.TRANSACTION, id: 'INCOME-LIST' },
        ApiTag.ACCOUNT,
      ],
    },

    //
    // Transfer
    //
    transfersFindAllByUser: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: 'LIST' },
        { type: ApiTag.TRANSACTION, id: 'TRANSFER-LIST' },
        { type: ApiTag.TRANSACTION, id: `PAGE-${res?.currentPage}` },
        ...(res?.data.map(({ id }) => ({
          type: ApiTag.TRANSACTION,
          id,
        })) ?? []),
      ],
    },
    transfersFindMonthlySummariesByuser: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.TRANSACTION, id: 'TRANSFER-SUMMARY' },
        ...(res?.map(({ id }) => ({
          type: ApiTag.TRANSACTION,
          id: JSON.stringify(id),
        })) ?? []),
      ],
    },
    transfersFindOne: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: res?.id },
      ],
    },
    transfersCreate: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.TRANSACTION, id: 'TRANSFER-LIST' },
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.ACCOUNT, id: args.createTransferDto.fromAccount },
        { type: ApiTag.ACCOUNT, id: args.createTransferDto.toAccount },
      ],
    },
    transfersUpdate: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.TRANSACTION, id: res?.id },
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.TRANSACTION, id: 'TRANSFER-LIST' },
        { type: ApiTag.ACCOUNT, id: args.updateTransferDto.fromAccount },
        { type: ApiTag.ACCOUNT, id: args.updateTransferDto.toAccount },
        { type: ApiTag.ACCOUNT, id: res?.fromAccount },
        { type: ApiTag.ACCOUNT, id: res?.toAccount },
      ],
    },
    transfersRemove: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.TRANSACTION, id: args.id },
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        { type: ApiTag.TRANSACTION, id: 'TRANSFER-LIST' },
        ApiTag.ACCOUNT,
      ],
    },

    //
    // Transaction
    //
    transactionsFindAllByUser: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: 'LIST' },
        { type: ApiTag.TRANSACTION, id: `PAGE-${res?.currentPage}` },
        ...(res?.data.map(({ id }) => ({
          type: ApiTag.TRANSACTION,
          id,
        })) ?? []),
      ],
    },
    transactionsFindMonthlySummariesByUser: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: 'SUMMARY' },
        ...(res?.map(({ id }) => ({
          type: ApiTag.TRANSACTION,
          id: JSON.stringify(id),
        })) ?? []),
      ],
    },
    transactionsFindAllByAccount: {
      providesTags: (res) => [
        ApiTag.TRANSACTION,
        { type: ApiTag.TRANSACTION, id: 'LIST' },
        { type: ApiTag.TRANSACTION, id: `PAGE-${res?.currentPage}` },
        ...(res?.data.map(({ id }) => ({
          type: ApiTag.TRANSACTION,
          id,
        })) ?? []),
      ],
    },

    //
    // Category
    //
    transactionCategoriesFindAllByUser: {
      providesTags: (res) => [
        ApiTag.CATEGORY,
        { type: ApiTag.CATEGORY, id: 'LIST' },
        ...(res?.map(({ id }) => ({
          type: ApiTag.CATEGORY,
          id,
        })) ?? []),
      ],
    },
    transactionCategoriesFindOne: {
      providesTags: (res) => [
        ApiTag.CATEGORY,
        { type: ApiTag.CATEGORY, id: res?.id },
      ],
    },
    transactionCategoriesCreate: {
      invalidatesTags: [{ type: ApiTag.CATEGORY, id: 'LIST' }],
    },
    transactionCategoriesUpdate: {
      invalidatesTags: (res) => [
        { type: ApiTag.CATEGORY, id: res?.id },
        { type: ApiTag.CATEGORY, id: 'LIST' },
      ],
    },
    transactionCategoriesRemove: {
      invalidatesTags: (res, err, args) => [
        { type: ApiTag.CATEGORY, id: args.id },
        { type: ApiTag.CATEGORY, id: 'LIST' },
      ],
    },
  },
});
