import React, { useEffect, useState } from "react";
import formatCurrency from "../../utils/formatCurrency";
import Stats from "../stats/stats";
import StatsItem from "../stats/stats.item";
import { getAllAccounts } from "../../pages/accounts/AccountService";
import { getAllExpenses } from "../../pages/expenses/ExpenseService";
import { getAllIncomes } from "../../pages/income/IncomeService";

interface IProps {
  label?: string;
  className?: string;
}

const DashboardStats = ({ label, className = "" }: IProps): JSX.Element => {
  const [accountsRaw, setAccountsRaw] = useState<IAccount[] | null>(null);
  const [totalBalance, setTotalBalance] = useState<number>(NaN);
  const [expensesRaw, setExpensesRaw] = useState<IExpense[] | null>(null);
  const [totalExpenses, setTotalExpenses] = useState<number>(NaN);
  const [incomesRaw, setIncomesRaw] = useState<IIncome[] | null>(null);
  const [totalIncomes, setTotalIncomes] = useState<number>(NaN);

  useEffect(() => {
    const fetchAccounts = async () => {
      setAccountsRaw(await getAllAccounts());
    };
    fetchAccounts();

    const fetchExpenses = async () => {
      setExpensesRaw(await getAllExpenses());
    };
    fetchExpenses();

    const fetchIncomes = async () => {
      setIncomesRaw(await getAllIncomes());
    };
    fetchIncomes();
  }, []);

  useEffect(() => {
    if (accountsRaw === null) return;

    const total = accountsRaw.reduce(
      (currentTotal, { balance, type }) =>
        currentTotal + (type !== "loan" ? balance : 0),
      0
    );

    setTotalBalance(total);
  }, [accountsRaw]);

  useEffect(() => {
    if (incomesRaw === null) return;

    const total = incomesRaw.reduce((currentTotal, { amount, date }) => {
      const currentMonth = new Date().getMonth() + 1;
      const month = new Date(date).getMonth() + 1;

      if (currentMonth === month) {
        return currentTotal + amount;
      }

      return currentTotal;
    }, 0);

    setTotalIncomes(total);
  }, [incomesRaw]);

  useEffect(() => {
    if (expensesRaw === null) return;

    const total = expensesRaw.reduce((currentTotal, { amount, date }) => {
      const currentMonth = new Date().getMonth() + 1;
      const month = new Date(date).getMonth() + 1;

      if (currentMonth === month) {
        return currentTotal + amount;
      }

      return currentTotal;
    }, 0);

    setTotalExpenses(total);
  }, [expensesRaw]);

  return (
    <Stats className={`${className}`} label={label}>
      <StatsItem statLabel="Balance">
        {Number.isNaN(totalBalance) ? "-" : formatCurrency(totalBalance)}
      </StatsItem>
      <StatsItem statLabel="Income">
        {Number.isNaN(totalIncomes) ? "-" : formatCurrency(totalIncomes)}
      </StatsItem>
      <StatsItem statLabel="Expenses">
        {Number.isNaN(totalExpenses) ? "-" : formatCurrency(totalExpenses)}
      </StatsItem>
    </Stats>
  );
};

export default DashboardStats;
