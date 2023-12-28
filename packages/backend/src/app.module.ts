import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import MongoStore from 'connect-mongo';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import passport from 'passport';

import { configuration } from './config/configuration';
import { AccountBalanceChangesModule } from './modules/account-balance-changes/account-balance-changes.module';
import { AccountsModule } from './modules/accounts/accounts.module';
import { AuthModule } from './modules/auth/auth.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { HealthCheckModule } from './modules/health-check/health-check.module';
import { IncomesModule } from './modules/incomes/incomes.module';
import { SystemModule } from './modules/system/system.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { TransactionCategoriesModule } from './modules/transaction-categories/transaction-categories.module';
import { TransactionCategoryMappingsModule } from './modules/transaction-category-mappings/transaction-category-mappings.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { TransfersModule } from './modules/transfers/transfers.module';
import { UserDataModule } from './modules/user-data/user-data.module';
import { UserPreferencesModule } from './modules/user-preferences/user-preferences.module';
import { UsersModule } from './modules/users/users.module';
import { ServeStaticPagesModule } from './serve-static-pages.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      load: [configuration],
      isGlobal: true,
    }),
    ServeStaticPagesModule,
    AuthModule.register(),
    UsersModule,
    AccountsModule,
    TransactionsModule,
    TransactionCategoriesModule,
    TransactionCategoryMappingsModule,
    UserDataModule,
    ExpensesModule,
    IncomesModule,
    TransfersModule,
    AccountBalanceChangesModule,
    HealthCheckModule,
    UserPreferencesModule,
    TasksModule,
    SystemModule,
  ],
})
export class AppModule implements NestModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        session({
          secret: this.configService.get<string>('cookieKey'),
          cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 30,
          },
          saveUninitialized: false,
          resave: false,
          store: MongoStore.create({
            mongoUrl: this.configService.get('mongodbConnectionString'),
            touchAfter: 60 * 60 * 24,
          }),
        }),
        cookieParser(),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
}
