import { Module } from '@nestjs/common';
import { TransactionService } from './services/transaction.service';
import { TransactionController } from './controllers/transaction.controller';

@Module({
  providers: [TransactionService],
  controllers: [TransactionController]
})
export class TransactionsModule {}
