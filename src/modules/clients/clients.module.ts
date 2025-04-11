import { ClientsService } from './clients.service';
import { Module, OnModuleInit } from '@nestjs/common';
import { ClientsController } from './clients.controller';
import { setupDynamoDB } from 'src/config/dynamodb.config';
import { RedisCacheModule } from 'src/common/services/redis-cache.module';

@Module({
  exports: [ClientsService],
  imports: [RedisCacheModule],
  providers: [ClientsService],
  controllers: [ClientsController],
})
export class ClientsModule implements OnModuleInit {
  onModuleInit() {
    setupDynamoDB();
  }
}
