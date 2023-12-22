import { AccountType } from '$api/generated/financerApi';
import { IconName } from '$elements/icon/icon';

export const accountTypeIconMapping: { [key in AccountType]: IconName } = {
  [AccountType.Cash]: IconName.cash,
  [AccountType.Savings]: IconName.star,
  [AccountType.Investment]: IconName.trendingUp,
  [AccountType.Credit]: IconName.creditCard,
  [AccountType.Loan]: IconName.library,
  [AccountType.LongTermSavings]: IconName.star,
  [AccountType.PreAssignedCash]: IconName.paperAirplane,
};

export const accountTypeLabelMapping: { [key in AccountType]: string } = {
  [AccountType.Cash]: 'cash',
  [AccountType.Savings]: 'savings',
  [AccountType.Investment]: 'investment',
  [AccountType.Credit]: 'credit',
  [AccountType.Loan]: 'loan',
  [AccountType.LongTermSavings]: 'long-term savings',
  [AccountType.PreAssignedCash]: 'pre-assigned cash',
};
