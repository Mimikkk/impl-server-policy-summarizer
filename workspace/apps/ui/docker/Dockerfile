FROM oven/bun:latest AS build

# Monorepo layout: ui/tsconfig.json extends ../../../tsconfig.web.json (repo root).
WORKDIR /repo
COPY tsconfig.base.json tsconfig.web.json ./

WORKDIR /repo/workspace/apps/ui
# Copy app before install so we never overlay node_modules (avoids file/dir merge errors with BuildKit).
COPY workspace/apps/ui/ ./

ARG CLIENT_SERVER_URL=http://localhost:8080
ARG CLIENT_ELI_URL=https://api.sejm.gov.pl/eli
RUN bun install --frozen-lockfile \
  && printf 'CLIENT_SERVER_URL=%s\nCLIENT_ELI_URL=%s\n' "${CLIENT_SERVER_URL}" "${CLIENT_ELI_URL}" > .env \
  && bun run build

FROM nginx:1.27-alpine

COPY --from=build /repo/workspace/apps/ui/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/workspace/apps/ui/dist /usr/share/nginx/html

EXPOSE 80
