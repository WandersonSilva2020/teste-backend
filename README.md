<h1> Documentação </h1>

<H2> O que foi usado</H2>
<li> NestJS </li>
<li> Prisma (queryraw) </li>
<li> Zod </li>
<li> plugin Dayjs</li>
<li> Auth JWT com AuthGuard</li>

<div style="margin-top: 20px; padding: 10px;">
<h3> Endpoint </h3>
 GET url/maintenance/reports/performance-indicator
 header: x-api-key : 'BananaSystem-2002-@gyn'

Query Params:
StartDate: Date - opcional
EndDate: Date - opcional
TypeMaintenance: string - opcional

</div>
<div style="margin-top: 20px;  padding: 10px;">
<h3> como funciona a logica de validação </h3>
<li> Se o startDate não for informado, ele pega 30 dias atrás atraves de um pipe e um dto chamados zod-validation.pipe.ts e ReadIndicatorDTO.ts</li>
<li> Se o endDate não for informado, ele pega a data atual atraves de um pipe e um dto chamados zod-validation.pipe.ts e ReadIndicatorDTO.ts</li>
<li> Se o typeMaintenance não for informado, ele pega apenas o tipo 1 atraves de um pipe e um dto chamados zod-validation.pipe.ts e ReadIndicatorDTO.ts</li>
<li> O id do cliente é automaticamente populado pelo pipe com id 405</li>

<div style="margin-top: 20px; padding: 10px;">
<h3> Como funciona a logica do relatorio (Detalhado)</h3>

<p>Abaixo detalhado o processo de extração e cálculo dos indicadores (KPIs):</p>

<h4>1. Extração de Dados</h4>
<ul>
<li><strong>Equipamentos:</strong> Busca todos os equipamentos ativos do cliente na tabela <code>cadastro_de_equipamentos</code>.</li>
<li><strong>Tempo Programado (Escalas):</strong> Busca os horários de trabalho previstos na tabela <code>sofman_prospect_escala_trabalho</code> para os equipamentos encontrados, dentro do período (startDate a endDate).</li>
<li><strong>Tempo de Manutenção (Paradas):</strong> Busca as ordens de serviço e apontamentos de parada na tabela <code>sofman_apontamento_paradas</code> cruzando com <code>controle_de_ordens_de_servico</code>.
  <ul>
  <li>Se <code>typeMaintenance</code> for informado, filtra apenas pelos tipos especificados.</li>
  <li>Caso contrário, por padrão, considera apenas o tipo '1' (Manutenção Corretiva).</li>
  </ul>
</li>
</ul>

<h4>2. Processamento por Família</h4>
<p>Os dados são agrupados pela família do equipamento. Para cada família:</p>
<ul>
<li><strong>Tempo Programado Total (T_Prev):</strong> Soma das horas de escala de todos os equipamentos da família.</li>
<li><strong>Tempo de Manutenção Total (T_Maint):</strong> Soma da duração das paradas (data_hora_start - data_hora_stop).</li>
<li><strong>Número de Paradas (N_Paradas):</strong> Contagem total de intervenções.</li>
<li><strong>Tempo Operacional (T_Op):</strong> <code>T_Prev - T_Maint</code> (Tempo que o equipamento deveria trabalhar menos o tempo parado).</li>
</ul>

<h4>3. Fórmulas dos Indicadores</h4>
<p>Os valores finais são convertidos para horas antes do cálculo:</p>
<ul>
<li><strong>DF (Disponibilidade Física %):</strong>
  <br><code>(Tempo Operacional / Tempo Programado Total) * 100</code>
  <br><em>Representa a porcentagem do tempo planejado em que o equipamento esteve disponível para operar.</em>
</li>
<li><strong>MTBF (Mean Time Between Failures - Horas):</strong>
  <br><code>Tempo Operacional / Número de Paradas</code>
  <br><em>Tempo médio que a família de equipamentos opera sem falhar. Se N_Paradas for 0, considera-se 1 para evitar divisão por zero.</em>
</li>
<li><strong>MTTR (Mean Time To Repair - Horas):</strong>
  <br><code>Tempo de Manutenção Total / Número de Paradas</code>
  <br><em>Tempo médio gasto para reparar uma falha.</em>
</li>
</ul>
</div>
