// eslint-disable-next-line prettier/prettier
import { Controller, Get, Query, HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import type { ReadIndicatorDTO } from './dto/read-indicator.dto';
import { ReadIndicatorSchema } from './dto/read-indicator.dto';
import { IndicadorService } from './indicador.service';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@Controller('/maintenance/reports/')
@UseGuards(ApiKeyGuard)
export class IndicadorController {
  constructor(private readonly indicadorService: IndicadorService) {}

  @Get('performance-indicator')
  async getIndicadores(
    @Query(new ZodValidationPipe(ReadIndicatorSchema)) query: ReadIndicatorDTO,
  ) {
    const busca = await this.indicadorService.buscarIndicadores(query);
    if (!busca || !busca.success) {
      throw new HttpException(
        busca?.mensagem || 'Erro ao buscar indicadores',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: busca.success,
      data: busca.data,
    };
  }
}
