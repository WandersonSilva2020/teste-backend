import { Injectable, Logger } from '@nestjs/common';
import { ReadIndicatorDTO } from './dto/read-indicator.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class IndicadorService {
  private readonly logger = new Logger(IndicadorService.name);
  constructor(private prisma: PrismaService) {}

  async buscarIndicadores(campos: ReadIndicatorDTO) {
    type EscalaTrabalho = {
      id_equipamento: number;
      inicio: Date;
      termino: Date;
    };
    type ParadaManutencao = {
      id_equipamento: number;
      data_hora_stop: Date;
      data_hora_start: Date;
    };
    type Equipamento = {
      id_cliente: number;
      id: number;
      id_familia: number;
      familia: string;
    };

    type DadosFamilia = {
      Familia: string;
      tempo_prev: number;
      tempo_corretiva: number;
      totalParadas: number;
      somaDF: number;
      countAtivos: number;
    };

    const timeToMinutes = (time: string | number | Date) => {
      if (!time) return 0;
      const d = new Date(time);
      return d.getUTCHours() * 60 + d.getUTCMinutes();
    };

    try {
      const equipamentos = await this.prisma.$queryRaw<Equipamento[]>`
        SELECT e.id_cliente, e.id, e.id_familia, f.familia
        FROM cadastro_de_equipamentos e
        LEFT JOIN cadastro_de_familias_de_equipamento f ON e.id_familia = f.id
        WHERE e.status_equipamento = 'Ativo' AND e.id_cliente = ${campos.id_cliente}
      `;

      const ids = equipamentos.map((e) => e.id);
      if (ids.length === 0) return { success: true, data: [] };

      // 2. Busca Escalas e Paradas
      const [horarios, paradas] = await Promise.all([
        this.prisma.$queryRaw<EscalaTrabalho[]>`
          SELECT id_equipamento, inicio, termino FROM sofman_prospect_escala_trabalho 
          WHERE id_equipamento IN (${Prisma.join(ids)}) AND data_programada BETWEEN ${campos.startDate} AND ${campos.endDate}`,
        this.prisma.$queryRaw<ParadaManutencao[]>`
          SELECT co.id_equipamento, ap.data_hora_stop, ap.data_hora_start
          FROM controle_de_ordens_de_servico co
          JOIN sofman_apontamento_paradas ap ON co.id = ap.id_ordem_servico
          WHERE co.id_equipamento IN (${Prisma.join(ids)}) 
          AND ap.data_hora_stop BETWEEN ${campos.startDate} AND ${campos.endDate}
          ${campos.typeMaintenance.length ? Prisma.sql`AND co.tipo_manutencao IN (${Prisma.join(campos.typeMaintenance)})` : Prisma.empty}`,
      ]);

      // 3. Agrupamento
      const familiasMap = new Map<string, DadosFamilia>();

      equipamentos.forEach((eq) => {
        const nomeFam = eq.familia || 'SEM FAMILIA';
        if (!familiasMap.has(nomeFam)) {
          familiasMap.set(nomeFam, {
            Familia: nomeFam,
            tempo_prev: 0,
            tempo_corretiva: 0,
            totalParadas: 0,
            somaDF: 0,
            countAtivos: 0,
          });
        }
        const agregacao = familiasMap.get(nomeFam)!;

        const tPrev = horarios
          .filter((h) => h.id_equipamento === eq.id)
          .reduce(
            (acc, h) =>
              acc + (timeToMinutes(h.termino) - timeToMinutes(h.inicio)),
            0,
          );
        const pEq = paradas.filter((p) => p.id_equipamento === eq.id);
        const tMaint = pEq.reduce(
          (acc, p) =>
            acc +
            (new Date(p.data_hora_start).getTime() -
              new Date(p.data_hora_stop).getTime()) /
              60000,
          0,
        );

        if (tPrev > 0) {
          agregacao.tempo_prev += tPrev;
          agregacao.tempo_corretiva += tMaint;
          agregacao.totalParadas += pEq.length;
          agregacao.countAtivos += 1;
        }
      });

      // 4. Retorno formatado
      const data = Array.from(familiasMap.values()).map((f) => {
        const tempoOpTotalHoras = (f.tempo_prev - f.tempo_corretiva) / 60;
        const tempoMaintTotalHoras = f.tempo_corretiva / 60;

        // Requisito: Forçar 1 se for zero
        const divP = f.totalParadas || 1;

        return {
          Familia: f.Familia,
          DF: Number(
            ((tempoOpTotalHoras / (f.tempo_prev / 60 || 1)) * 100).toFixed(2),
          ),
          MTBF: Number((tempoOpTotalHoras / divP).toFixed(2)),
          MTTR: Number((tempoMaintTotalHoras / divP).toFixed(2)),
          Paradas: f.totalParadas,
          tempo_prev: Math.round(f.tempo_prev),
          tempo_corretiva: Math.round(f.tempo_corretiva),
        };
      });

      return { success: true, data };
    } catch (error) {
      this.logger.error('Erro indicadores', error);
      return { success: false, data: [], mensagem: 'Erro interno' };
    }
  }
}
