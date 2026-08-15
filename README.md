# Campanha Realista — ETS2 / ATS

Caderno digital da **Campanha Realista** para Euro Truck Simulator 2 e American Truck Simulator.

O jogo perde a graça quando o jogador compra tudo. A campanha (idealizada pelo canal [Tio Restanho](https://www.youtube.com/)) impõe uma carreira em **4 níveis** — Empregado → Empregado com caminhão próprio → Autônomo → Empresário — com controle manual de dinheiro, refeições, estadia, cargas, comissões, salários, financiamentos e multas. Este app digitaliza esse controle, que seria feito em um caderno.

## O que o app faz

- Mantém o **saldo da campanha por perfil** (o dinheiro dentro do jogo é administrado pelo jogador).
- Registra **dia/hora do jogo, refeições, estadia, cargas e comissões**.
- Calcula **salários, comissões, financiamentos, seguro ATS, encargos e salários de funcionários** por nível.
- **Sugere a próxima ação** (refeições, fim de turno, pagamentos, cargas) com base nas regras.
- Gera e **copia para o clipboard o comando `g_set_time`** do console do jogo ao avançar o tempo.
- Suporta **múltiplos perfis** (ex.: uma campanha ATS e outra ETS2) e **exportação/importação** de backup em JSON.

## Níveis da campanha

| Nível | Descrição | Comissão/renda |
|---|---|---|
| 1 — Empregado | Caminhão, combustível, pedágio e viagens da empresa | Salário + 5% do frete |
| 2 — Empregado c/ caminhão | Caminhão próprio (agregado) | Salário + 10% do frete |
| 3 — Autônomo | Caminhão + reboque, tudo por sua conta | 20% do frete |
| 4 — Empresário | Gerencia caminhões e funcionários | 30% do frete |

As regras completas (setup do jogo, comandos de console, custos, tombamentos, financiamentos etc.) estão em [`campanha_realista_regras.md`](campanha_realista_regras.md).

## Stack

- **Apenas HTML + CSS + JavaScript + Bootstrap 5.3** (via CDN jsdelivr).
- Sem build, sem frameworks, sem backend, sem dependências locais.

## Stack

- **Apenas HTML + CSS + JavaScript + Bootstrap 5.3** (via CDN jsdelivr).
- Sem build, sem frameworks, sem backend, sem dependências locais.
- É um **PWA** (manifest + service worker): pode ser instalado no navegador/celular e funciona offline.

## Versão online

Uma versão funcional está disponível em **[https://campanha-realista.netlify.app/](https://campanha-realista.netlify.app/)**.

## Como rodar

O app é um PWA, então precisa ser servido via HTTP em `localhost` (o service worker **não** registra no protocolo `file://`):

```bash
npx serve .
# ou
python -m http.server
```

Depois abra `http://localhost:3000` (ou a porta exibida). Para instalar como app, use o ícone "Instalar" do navegador.

## Como usar

1. **Novo perfil**: escolha o jogo (ATS/ETS2) e o nome da campanha. Saldo inicial: $5.000 / €5.000.
2. **Configurações**: defina a cidade-base e a empresa da campanha.
3. Avance o tempo do jogo até **segunda-feira, 07:00** — o app copia o comando `g_set_time 7` para o console.
4. No dia a dia: registre refeições, estadia, cargas e pagamentos pelas **ações rápidas**. O app indica o que fazer a seguir.
5. Na aba **Cargas**, registre o frete (origem, destino, valor) — a comissão é calculada automaticamente pelo nível.
6. Na aba **Funcionários** (nível 4), contrate motoristas: salário + 70% de encargos a cada 30 dias, comissão de 5% do frete.

> Dica: o console do jogo precisa ser habilitado no `config.cfg` (veja as regras em [`campanha_realista_regras.md`](campanha_realista_regras.md)).

## Dados

Tudo fica no **`localStorage`** do navegador, sem backend:

| Chave | Conteúdo |
|---|---|
| `realistic_campaign_app` | Perfis e estado (extrato, cargas, funcionários) |
| `realistic_campaign_config` | Configurações globais (valores e percentuais) |
| `realistic_campaign_theme` | Tema claro/escuro |
| `realistic_campaign_active_tab` | Aba ativa |

Faça **backups** com o botão *Exportar JSON* na barra superior (o `localStorage` é específico do navegador/perfil).

## Deploy (publicar o PWA)

O app é estático, então hospedagens gratuitas funcionam. Caminhos são **relativos** (`./index.html`, `./sw.js`), então funcionam em subpasta.

- **GitHub Pages** — `git push` + Settings → Pages → branch `main` / root → `https://usuario.github.io/repo/` (HTTPS automático, sem limite de banda).
- **Netlify Drop** — arraste a pasta em [netlify.com/drop](https://netlify.com/drop) → URL `https://nome.netlify.app` (100 GB/mês grátis).
- **Vercel** — `vercel deploy` ou importe o repo → URL `https://projeto.vercel.app` (100 GB/mês grátis).

Todos servem em HTTPS (necessário para o service worker).

## Estrutura

```
├── index.html                  # SPA (abas, modais, toasts)
├── version.js                  # Versão única do app (APP_VERSION)
├── app.js                      # Lógica, estado, renderização e eventos
├── styles.css                  # Estilos custom (resto vem do Bootstrap)
├── manifest.webmanifest        # Manifest do PWA
├── sw.js                       # Service worker (cache/offline)
├── icon-192.png                # Ícone PWA 192x192
├── icon-512.png                # Ícone PWA 512x512
├── campanha_realista_regras.md # Fonte da verdade das regras
├── youtube_transcription.txt   # Transcrição do vídeo original
└── AGENTS.md                   # Instruções para agentes de IA trabalharem no repo
```
