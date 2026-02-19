import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { IndicadorController } from './indicador.controller';
import { IndicadorService } from './indicador.service';

@Module({
  imports: [PrismaModule],
  controllers: [IndicadorController],
  providers: [IndicadorService],
})
export class IndicadorModule {}
