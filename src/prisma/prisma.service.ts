import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined');
    }

    const adapter = new PrismaMariaDb(
      connectionString.replace('mysql://', 'mariadb://'),
    );

    super({
      adapter,
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Conectado ao banco com sucesso');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('❌ Falha na conexão:', message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
