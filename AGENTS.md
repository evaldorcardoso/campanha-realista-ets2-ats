# AGENTS.md

## Project idea & objective

Este app é o "caderno" de uma **Campanha Realista** para Euro Truck Simulator 2 / American Truck Simulator. A ideia vem do vídeo do canal Tio Restanho (`youtube_transcription.txt`) e das regras compiladas em `campanha_realista_regras.md`: o jogo fica sem graça quando o jogador compra tudo, então a campanha impõe uma carreira em 4 níveis (Empregado → Empregado c/ caminhão → Autônomo → Empresário) com controle manual de dinheiro, refeições, estadia, frete, salários, financiamentos e multas.

**Objetivo do app:** digitalizar esse controle que seria feito no papel — registrar dia/hora, refeições, estadia, cargas, comissões, salários, funcionários, sugerir a próxima ação e copiar o comando `g_set_time` do console do jogo. O app mantém o saldo da campanha por conta; o dinheiro dentro do jogo é administrado pelo jogador.

## Stack (obrigatório)

- **Apenas HTML + CSS + JavaScript + Bootstrap 5.3** (via CDN jsdelivr). 
- **Proibido** introduzir: Node/npm, bundlers, frameworks JS, bibliotecas, backend, build steps, testes automatizados, lint.
- Sem `package.json`, sem `node_modules`. Para rodar: servir a pasta via HTTP em `localhost` com `npx serve .` (ou `python -m http.server`) — **não** usar `file://` porque o service worker não registra nesse protocolo.
- Não há script de lint/typecheck/teste. Verificação = abrir no navegador e conferir o comportamento manualmente.

## Estrutura

- `index.html` — toda a estrutura da SPA (abas, modais, toasts). Único arquivo HTML.
- `app.js` — toda a lógica (estado, renderização, eventos). Sem módulos/classes; script global.
- `styles.css` — estilos custom (o resto vem do Bootstrap).
- `manifest.webmanifest` — manifest do PWA (nome, ícones, cores, display standalone). Caminhos **relativos** (`./`) porque o app pode ser servido em subpasta (ex.: GitHub Pages). Ao mudar ícones/cores, editar aqui e no `index.html` (`theme-color`, `apple-touch-icon`).
- `sw.js` — service worker. Precache do app shell + Bootstrap CDN (`cdn.jsdelivr.net`), estratégia cache-first com fallback de rede. `CACHE_VERSION` (prefixo `campanha-realista-vN`) deve ser incrementado ao mudar arquivos cached para forçar update. **Não registra em `file://`** — testar via `npx serve .` em `http://localhost:3000`. Ao subir nova versão no Netlify (prod), **relembrar** de incrementar `CACHE_VERSION` também (sw.js) para forçar atualização do cache dos usuários PWA.
- `icon-192.png` / `icon-512.png` — ícones do PWA (PNG). Regenerar via `gen-icons.ps1` (PowerShell + System.Drawing) se precisar mudar o logo.
- `campanha_realista_regras.md` — fonte da verdade das regras (derivada de `youtube_transcription.txt`). **Ao alterar regras, manter em sincronia** com o conteúdo renderizado em `renderRules()` no `app.js`.

## Regras do código que um agente provavelmente erraria

- **Idioma:** UI e números em **pt-BR** (`toLocaleString('pt-BR')`). Moeda `$` (ATS) ou `€` (ETS2). Mantenha texto de UI em português.
- **Persistência:** tudo em `localStorage` (sem backend). Chaves: `realistic_campaign_app` (perfis/estado), `realistic_campaign_config` (configs), `realistic_campaign_theme`, `realistic_campaign_active_tab`.
- **Config global:** valores padrão ficam em `DEFAULT_CONFIG` (`app.js:19`) e são clonados/sanitizados por `sanitizeConfig()`. A aba "Configurações" edita o mesmo objeto `cfg` — mudar a UI exige manter os ids `cfg-*` e o mapeamento em `fillConfigForm()`/`saveConfigForm()`.
- **Renderização por string:** `renderAll()` reconstrói o DOM via `innerHTML` e chama `bindActionButtons()` de novo — handlers NÃO devem ser anexados fora do render, ou serão perdidos ao re-renderizar. Botões usam `data-act` e são roteados por `handleAction()`.
- **Comandos do console:** avançar tempo/hora gera e copia automaticamente o comando `g_set_time` para o clipboard (função `emitTimeCmd`/`setCommand`).
- **Níveis:** `p.level` (1–4) controla tudo — quem paga refeição/estadia/combustível/pedágio (`employerPaysMeals`/`employerPaysLodging` = nível ≤ 2), comissão (`cfg.commission[n]`), salário (`cfg.salary[n]`), seguro ATS (só nível 3+, só ATS), funcionários (só nível 4).
- **Rastreabilidade:** ao avançar tempo, o app marca `p.currentCity`, `p.lastSalaryDay`, `p.lastInsuranceDay`. "Em trajeto" é **derivado** (não é estado): `isInTransit(p)` = existe carga ativa dirigida pelo jogador (`p.cargo` com `status === 'active'` e `driver === 'player'`) — não há botão manual para alternar. O campo legado `p.inTransit` permanece apenas para compat de dados salvos e não deve ser lido/escrito. Não introduza estados novos sem atualizar `normalizeProfile()` (backward-compat de dados salvos) e a exportação/importação JSON.
