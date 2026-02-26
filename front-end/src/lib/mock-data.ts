// Dados de exemplo conforme documentação do backend
// Estrutura esperada pelo endpoint: GET /maintenance/reports/performance-indicator
export const mockPerformanceData = [
  {
    Familia: 'COMPRESSORES',
    DF: 85.50,
    MTBF: 120.5,
    MTTR: 4.2,
    Paradas: 15,
    tempo_prev: 1800,
    tempo_corretiva: 63,
  },
  {
    Familia: 'BOMBAS',
    DF: 92.30,
    MTBF: 200.8,
    MTTR: 2.5,
    Paradas: 8,
    tempo_prev: 2000,
    tempo_corretiva: 20,
  },
  {
    Familia: 'MOTORES',
    DF: 88.75,
    MTBF: 156.3,
    MTTR: 3.8,
    Paradas: 12,
    tempo_prev: 1920,
    tempo_corretiva: 45.6,
  },
  {
    Familia: 'VENTILADORES',
    DF: 95.20,
    MTBF: 280.4,
    MTTR: 1.8,
    Paradas: 5,
    tempo_prev: 1680,
    tempo_corretiva: 9,
  },
  {
    Familia: 'REDUTORES',
    DF: 90.15,
    MTBF: 175.2,
    MTTR: 3.2,
    Paradas: 10,
    tempo_prev: 1750,
    tempo_corretiva: 32,
  },
]
