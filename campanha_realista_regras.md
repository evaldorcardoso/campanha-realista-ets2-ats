# Campanha Realista — ETS2 / ATS

Regras extraídas da transcrição do vídeo do canal **Tio Restanho** ("Como fazer uma carreira realista no Euro Truck Simulator 2 / American Truck Simulator").

> Vale para **ATS e ETS2** de forma igual (diferenças pontuais são indicadas).

---

## 1. Setup do Jogo

### 1.1 Habilitar o Console (fazer com o jogo FECHADO)

Para usar os comandos, você precisa habilitar o console do jogo. Isso é feito **uma única vez** (ou de novo se reinstalar o jogo). Siga o passo a passo:

1. **Feche o jogo.** O arquivo `config.cfg` só pode ser editado com o jogo fechado. Se ele estiver aberto, o jogo reescreve o arquivo ao fechar e desfaz a sua alteração.
2. **Encontre o arquivo.** No Windows, abra a pasta **Documentos** (Meus Documentos) e procure:
   - ETS2 → `Documentos\Euro Truck Simulator 2\config.cfg`
   - ATS → `Documentos\American Truck Simulator\config.cfg`
3. **Abra com o Bloco de Notas.** Clique com o botão direito em `config.cfg` → *Abrir com* → *Bloco de Notas* (Notepad). Não precisa de programa especial (Notepad++ também serve).
4. **Ligue o console.** Use **Ctrl+F** para procurar as duas linhas abaixo e mude o valor `"0"` para `"1"`:
   - `uset g_console "0"` → `uset g_console "1"`
   - `uset g_developer "0"` → `uset g_developer "1"` (pode ser `"2"`, mas `"1"` é suficiente)
5. **Salve e abra o jogo.** Aperte **Ctrl+S** para salvar, feche o Bloco de Notas e abra o jogo normalmente.
6. **Abra o console dentro do jogo.** Aperte a tecla `` ` `` (crase / acento grave — fica logo acima da tecla Tab, ao lado do número 1). Vai aparecer uma barra de texto na tela.
7. **Digite os comandos.** Cada comando + Enter, tudo em **minúsculas**.

> **Dica:** se o jogo avisar *"Unknown command"*, confira se digitou tudo minúsculo e se o console foi habilitado (Passo 4).

### 1.2 Comandos de Console

| Comando | Valor | Quando | Efeito |
|---|---|---|---|
| `g_brake_intensity` | `0.3` (default: 1) | Definitivo (uma vez) | Frenagem em ~30% da potência real |
| `g_traffic` | `2` (default: 1) | Definitivo (uma vez) | Dobra a quantidade de tráfego. `3` por conta e risco (aceita até 10) |
| `warp` | `0.92` | **Toda sessão** (reseta para 1 ao iniciar o jogo) | Deixa o jogo um pouco mais lento, aproximando da velocidade real de aproximação de um caminhão |
| `g_set_time H [M]` | ex.: `7` (07:00) ou `6 20` (06:20) | Quando necessário | Altera a hora do jogo. 1º valor = hora (0–23), 2º opcional = minutos. Se a hora informada já passou no dia atual, o jogo avança para ela no **dia seguinte** |

Exemplo de execução: digite `g_traffic 2` + Enter. Todo comando é confirmado com Enter.

### 1.3 Opções de Jogo

| Opção | Valor | Observação |
|---|---|---|
| Cansaço / fadiga | **Habilitado** | — |
| Parada obrigatória | **Desabilitada** | Cargas longas (ATS ~500 milhas, ETS2 ~700–800 km) extrapolam o limite de entrega se a parada for obrigatória → perde o pagamento da carga |
| Infrações de trânsito | **Habilitada** | Multas descontam do jogador |
| Dificuldade de estacionamento | **Aleatória / randômica** | — |
| Transmissão (H-Shifter/volante) | **Avançada** + mudança de marcha **pressionando a embreagem** | Só para quem joga com H. Quem joga sem H não mexe nisso |
| `g_income_factor` | **NÃO alterar** (default: 1) | Mudar bagunça a economia da campanha |
| Voz da navegação ("Fernandinha") | **Desabilitada** | Em Opções → Áudio |

Outras regras de setup:

- **Pode usar qualquer perfil existente** — não é preciso criar perfil novo.
- **Distância das cargas**: na **fase 1**, reduzir a distância das cargas (trabalhar mais local/regional). Aumentar nas fases seguintes.
- **Ordenação das cargas**: na **fase 1 e 2**, ordenar a lista de cargas **por data** (tempo de inspiração). Não necessário nas fases 3 e 4.

---

## 2. Fases da Campanha (4 Níveis)

### Nível 1 — Empregado

Você é empregado de uma empresa. Caminhão, combustível, pedágio, balsa/trem e despesas de viagem são da empresa.

**Início da campanha:**
- Escolher uma **cidade-base** (ex.: San Diego).
- Escolher a **empresa** em que trabalha naquela cidade (ex.: Plaster & Sons).
- Avançar o tempo do jogo para **segunda-feira, 07:00**.
- Saldo inicial: **$5.000 / €5.000**.

**Regras de turno:**
- Turno começa às **07:00** em cada dia útil (empregado).
- Turno vai das **07:00 às 18:00** (11h de trabalho, respeitando o intervalo de jornada).
- Paradas: **1h café da manhã**, **1h almoço**, **1h jantar** (quando em trajeto).
- Intervalo de jornada / descanso: **11 horas**.

**Custos (por conta do jogador quando NÃO em trajeto):**

| Item | Custo |
|---|---|
| Café da manhã | $15 / €15 |
| Almoço | $25 / €25 |
| Jantar | $20 / €20 |
| Estadia (não em trajeto) | $45 / €45 |

- Em **trajeto**, refeições e estadia são pagas pelo **empregador**.
- **Estadia na base**: quando está na cidade-base e não está em trajeto, a estadia é **por sua conta**. Se pernoitar fora da base sem estar em trajeto, paga estadia onde estiver.

**Renda:**
- Salário: **$1.300 / €1.300 por mês**, pago a cada **30 dias** (contar dia 1, 2, 3...; no dia 30 recebe).
- Comissão: **5% do valor do frete**, recebida **na entrega** da carga.

**Despesas cobertas pelo empregador:** pedágio, balsa/trem, combustível, refeições e estadia em viagem.

**Regras operacionais:**
- Cargas: **somente da sua empresa** (qualquer filial dela, em qualquer cidade).
- Descarga: **2 horas** (a considerar no planejamento).
- Transferência entre cidades sem filial: contar o tempo de deslocamento até a filial mais próxima.
- **Multas**: pagas pelo jogador.

**Tombamento / demissão:**
- **Se tombar o caminhão → é demitido.**
- Fica **10 dias parado** até achar novo emprego.
- Nesses dias continua pagando alimentação e estadia (o custo diário segue valendo).

### Nível 2 — Empregado com Caminhão Próprio

Você continua empregado, mas agora com **caminhão próprio** (como agregado). Turno e estrutura igual ao Nível 1.

**Regras de turno:** idênticas ao Nível 1 (início 07:00, refeições de 1h, custos 15/25/20, estadia 45).

**Renda:**
- Salário: **$1.500 / €1.500 por mês**, pago a cada **30 dias**.
- Comissão: **10% do valor do frete**, recebida na entrega.

**Despesas:**

| Item | Quem paga |
|---|---|
| Pedágio | Empregador |
| Balsa/Trem | Empregador |
| Tag (pedágio automático) | **Jogador** — custa **$15 / €15 por país** |
| Combustível | **Jogador** |
| Estadia e refeições em trajeto | Empregador |
| Manutenção do caminhão | **Jogador** |
| Multas | **Jogador** |

**Regras operacionais:** mesmas do Nível 1 (descarga 2h, intervalo de jornada 11h, cargas só da sua empresa, podendo pegar em qualquer filial).

**Tombamento:**
- **Pode ser demitido** → **10 dias parado** até novo emprego.
- Caminhão: **30 dias para consertar** — ou consertar antes pagando, se tiver dinheiro.

**Financiamento do caminhão:**
- Regra: **valor financiado + 20%**, dividido por **12 meses**.
- 1 parcela a cada **30 dias**.
- Exemplo: financiou **$10.000** → 10.000 + 20% = **$12.000** → **$1.000 por mês** (12 parcelas).

### Nível 3 — Autônomo (Caminhão + Reboque)

Você comprou um reboque e trabalha por conta própria.

**Regras de turno:**
- Turno **livre** — começa na hora que quiser.
- Paradas de 1h (café/almoço/jantar), custos seguem 15/25/20; estadia $45.

**Renda:**
- **Sem salário fixo.**
- Renda: **20% do valor do frete**.

**Despesas (tudo por sua conta):**

| Item | Quem paga |
|---|---|
| Pedágio | **Jogador** |
| Balsa/Trem | **Jogador** |
| Tag (por país) | **Jogador** — $15 / €15 por país |
| Combustível | **Jogador** |
| Estadia, refeições, manutenção | **Jogador** |

**Regras operacionais:**
- Descarga: o jogo calcula (~2h).
- Intervalo de jornada: **11 horas**.
- **Pode transportar para qualquer empresa** (sem vínculo).

**Acidentes:**
- Acidente leve (sem tombamento): **2 dias** para consertar o caminhão.
- **Tombamento: 30 dias** para consertar. Nesses dias paga tudo (alimentação, estadia etc.).

**Seguro:**
- **ATS apenas**: **$200 de seguro do veículo a cada 30 dias** (ETS2 não tem isso).

**Financiamento:** mesma regra — valor financiado + 20% ÷ 12 meses, 1 parcela a cada 30 dias.

### Nível 4 — Empresário

Regras **iguais ao Nível 3** (autônomo), acrescentando o **gerenciamento de funcionários**.

**Funcionários:**

| Item | Valor |
|---|---|
| Salário do funcionário | $1.300 / €1.300 por mês (a cada 30 dias) |
| Encargos | **70% sobre o salário**, pagos a cada 30 dias (ex.: paga 1.300 ao empregado + 70% ao "governo") |
| Comissão do funcionário | **5% do valor do frete** |
| Renda do jogador | **30% do valor do frete** informado no jogo |

**Despesas dos funcionários (pagas pelo jogador):** despesas de viagem, estadia e alimentação em trajeto.

**Multas dos funcionários:** pagas pelo próprio funcionário (o jogo não simula isso — anotar manualmente).

---

## 3. Regras de Gameplay

**Nível 1 (empregado):**
- Na segunda-feira, pegar a **primeira carga disponível** da sua empresa — **não escolher**.
- **Caminhões das gerações 1 e 2 = câmbio manual.** Geração 3 (mais novos) = automatizado.
- **GPS do caminhão**: se o caminhão tem GPS, usar o GPS **sem áudio**.
- **Sem GPS**: navegar pelo **mapa**.
- **Enquanto o caminhão está em movimento: NÃO abrir o mapa nem a câmera 2** — joga só na **câmera 1**. Para o caminhão para consultar o mapa.
- Dica: planejar o trajeto no início (anotar as direções no caderno) e se orientar pelas **placas** na estrada.
- **Fluxo-exemplo (carga de ~4h de trajeto):**
  - 07:00 → sai da empresa
  - 11:00 → chega no destino
  - 11:00–13:00 → **2h de descarga** (aproveitar para almoçar)
  - 13:00 → inicia retorno (carga rápida não tem carga de volta; contar as **4h de retorno**)
  - 17:00 → chega na empresa → **turno encerrado**, retorna no dia seguinte
- **Refeições em trajeto** = por conta da empresa; **café da manhã** sempre por sua conta; **jantar e estadia na base** = por sua conta.
- Avançar o tempo para **terça 07:00** e pegar nova carga (longa ou curta, respeitando paradas — não importa quantos dias demorar).
- Ao chegar em outra cidade: usar o **mapa logístico** para achar a filial da sua empresa. Se houver, pegar carga de lá para outro destino.
- **Fim do turno**: se o turno está acabando (7h→18h), ir ao hotel e avançar o tempo para 07:00 do dia seguinte.
- **Cidade sem filial da sua empresa**: achar a cidade mais próxima com filial, calcular a distância/tempo e **avançar o tempo para considerar o deslocamento** até lá.

**Nível 2 (empregado com caminhão próprio):**
- Chegou em cidade **sem filial da sua empresa** → achar uma cidade próxima e **rodar vazio (caminhão sem carga) até lá**, respeitando as paradas de descanso.

**Níveis 3 e 4 (autônomo/empresário):**
- Transporte **livre para qualquer empresa**.
- Gerenciar a própria grana e o cansaço — mais próximo do jogo normal.

**Clima diário (regra do app):**
- A cada **novo dia**, o app sorteia a **probabilidade de chuva** (0–100%).
- **70%** de chance de sair **até 10%** (chuva baixa); **30%** de chance de sair **mais de 10%** (chuva alta).
- Valor **informativo** — o jogador decide o impacto na campanha (ex.: evitar pegar carga em dia de chuva alta).

---

## 4. Tabela-Resumo Financeiro (por Nível)

| Item | Nível 1 | Nível 2 | Nível 3 | Nível 4 |
|---|---|---|---|---|
| Turno | 07:00 (fixo) | 07:00 (fixo) | Livre | Livre |
| Salário mensal | $1.300 | $1.500 | — | — |
| Comissão / renda do frete | 5% | 10% | 20% | 30% |
| Café / almoço / jantar | 15 / 25 / 20 | 15 / 25 / 20 | 15 / 25 / 20 | 15 / 25 / 20 |
| Estadia (fora de trajeto) | $45 | $45 | $45 | $45 |
| Refeições + estadia em trajeto | Empresa | Empresa | Jogador | Jogador |
| Combustível | Empresa | Jogador | Jogador | Jogador |
| Pedágio | Empresa | Empresa | Jogador | Jogador |
| Tag (por país) | — | Jogador ($15) | Jogador ($15) | Jogador ($15) |
| Manutenção | Empresa | Jogador | Jogador | Jogador |
| Multas | Jogador | Jogador | Jogador | Jogador |
| Descarga | 2h | 2h | ~2h (jogo) | ~2h (jogo) |
| Intervalo de jornada | 11h | 11h | 11h | 11h |
| Acidente leve | — | — | 2 dias conserto | 2 dias conserto |
| Tombamento | Demissão + 10 dias | Demissão + 10 dias + 30 dias conserto | 30 dias conserto | 30 dias conserto |
| Financiamento | — | valor +20% ÷ 12 meses | valor +20% ÷ 12 meses | valor +20% ÷ 12 meses |
| Seguro ATS (30 dias) | — | — | $200 | $200 |
| Cargas | Só da empresa | Só da empresa | Qualquer empresa | Qualquer empresa |
| Empregados | — | — | — | Salário 1300 + 70% encargos; comissão 5%; jogador recebe 30% |

---

## 5. Observações e Exemplos do Vídeo

- **Saldo inicial**: $5.000 / €5.000.
- **Exemplo ATS** (campanha do autor): dia 14, saldo em conta **$77.786** — acúmulo de **$2.786** em 14 dias (baseado no saldo inicial de $5.000 + saldo prévio do perfil).
- **Exemplo ETS2** (campanha do autor): fim da semana 5, saldo **€22.215** + dívida do caminhão. Entrada de **€6.000**, resto financiado. Caminhão usado com **+900.000 km** que começou a dar problema.
- Manutenção exemplo: troca de pneus dianteiros e traseiros ≈ **€5.000**.
- Exemplos de frete: Murcia → Sevilha = **€2.300**; Valladolid → Limoges = **€2.343** (valores brutos, sem descontar combustível).

**Pontos em aberto (da transcrição):**
- Salário do Nível 2: valor de **$1.500** confirmado manualmente (áudio cortado no vídeo).
- A regra de estadia na cidade-base (paga quando fora de trajeto) foi interpretada como: paga estadia sempre que **não estiver em trajeto**, incluindo na base.
- "11 horas de descanso/intervalo de jornada": simulada pelo jogador (a parada obrigatória do jogo fica desligada).
