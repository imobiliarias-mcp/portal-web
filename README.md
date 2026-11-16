# portal_web

Frontend do portal agregador de imobiliárias: busca pública de aluguéis com marca configurável por implantação (white label) e área de anunciantes (imobiliárias e corretores).

É um submódulo de [`imobiliarias`](https://github.com/imobiliarias-mcp/imobiliarias). Não é um módulo de provedor: ele consome a API HTTP do núcleo (`central_mcp`) e não coleta nada.

## O que faz

- **Busca pública** (`/`, `/imovel/[provider]/[code]`): mesma busca do frontend antigo (`central_mcp/web`), com os mesmos parâmetros de URL.
- **Anunciantes** (`/anunciantes`, `/painel/*`): cadastro, pedidos de vínculo com uma fonte ou um imóvel, imóveis vinculados (somente leitura), aviso de informação incorreta, exclusão de conta.
- **Administração** (`/admin/*`): aprovar, recusar e revogar pedidos; lista de anunciantes; avisos em aberto.

Anunciantes não criam nem editam imóveis. Os dados continuam vindo do site de cada imobiliária.

## Comandos

```bash
npm ci
cp .env.example .env                      # preencha os valores
docker compose --env-file .env -f compose.dev.yaml up -d   # PostgreSQL local em 127.0.0.1:5433
npm run db:migrate
npm run seed:admin                        # cria ou atualiza o administrador local
npm run dev                               # http://localhost:3100 (o núcleo deve estar em :8000)

npm run lint                              # eslint + tsc
npm test                                  # Vitest (regras de domínio)
npx vitest run tests/unit/claim-rules.test.ts
npm run seed:e2e && npm run test:e2e      # Playwright, contra a stack em execução
npm run build
```

Depois de mudar a configuração do Better Auth (plugins), regenere as tabelas: `npx auth@1.7.25 generate --config src/auth/auth.ts --output prisma/schema.prisma -y`. O comando sobrescreve o arquivo: recoloque os modelos do módulo comercial (fim do schema) e a relação `advertiser` em `User`, depois `npx prisma migrate dev`.

## Arquitetura

- `src/proxy.ts` encaminha `/api/providers`, `/api/locations`, `/api/facets`, `/api/search` e `/api/listings/*` para o núcleo (`CENTRAL_MCP_API_URL`). Em produção, o proxy reverso deve rotear esses caminhos direto para o núcleo: o limite de requisições do núcleo é por IP do cliente, e passando pelo Next todos os visitantes dividiriam o mesmo limite.
- `src/catalog/` é o cliente do navegador para essa API (portado de `central_mcp/web/src/lib`).
- `src/brand/` lê as variáveis `BRAND_*` no servidor, a cada requisição. Não use `NEXT_PUBLIC_*` para marca: isso fixaria o valor no build e uma imagem deixaria de servir várias marcas.
- `src/auth/` configura o Better Auth (Prisma, Google, plugins `admin` e `organization`). Cadastro por e-mail e senha é desabilitado; contas com senha só nascem de `src/auth/provision.ts` (administrador local).
- `src/modules/advertiser-commerce/` é o módulo comercial:
  - `domain/`: regras puras. `ListingRef` (`provider` + `code`) é a única identidade de imóvel. `AdvertiserLinks` decide se um anunciante pode agir sobre um imóvel.
  - `application/`: casos de uso (`SubmitClaim`, `DecideClaim`, `ListingAuthorization`) sobre as portas `ClaimStore` e `ListingCatalog`.
  - `infrastructure/`: PostgreSQL (Prisma) e cliente HTTP do núcleo.
  - `presentation/`: server actions, schemas zod e componentes.

Regras que o código garante:

- Criar perfil não dá acesso a nada. O vínculo é um pedido com status `APPROVED`, e só um administrador aprova.
- Portais agregadores (`vivareal`, `imovelweb`) só aceitam pedido por imóvel.
- Imóvel sem código não pode ser reivindicado.
- Toda ação sobre um imóvel passa por `ListingAuthorization`; o identificador enviado pelo navegador nunca basta.
- Cada mudança de status grava `ClaimAuditLog`. Ao excluir uma conta, o histórico fica, sem o autor.

## Variáveis de ambiente

Veja `.env.example`. `DATABASE_URL` e `BETTER_AUTH_SECRET` são obrigatórias. Sem `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, o botão do Google não aparece. URI de redirecionamento no Google: `<BETTER_AUTH_URL>/api/auth/callback/google`.

## Docker

`Dockerfile` (contexto: este diretório). O contêiner aplica as migrações, garante o administrador (`ADMIN_EMAIL`/`ADMIN_PASSWORD`, se definidos) e inicia o servidor na porta 3100. Saúde: `/healthz` (inclui o banco).

## Ainda não implementado

Cobrança (Mercado Pago), créditos, assinaturas e imóveis patrocinados na busca.
