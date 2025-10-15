import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdsConfigController } from './ads-config.controller';
import { AdsConfigService } from './ads-config.service';
import { AdsConfig, AdsConfigSchema } from '@/schemas/ads-config.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AdsConfig.name, schema: AdsConfigSchema },
    ]),
  ],
  controllers: [AdsConfigController],
  providers: [AdsConfigService],
  exports: [AdsConfigService],
})
export class AdsConfigModule {}
