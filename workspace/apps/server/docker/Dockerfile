FROM oven/bun:latest

# Same layout as local: server/tsconfig.json extends ../../../tsconfig.node.json
WORKDIR /repo
COPY tsconfig.base.json tsconfig.node.json ./

WORKDIR /repo/workspace/apps/server
COPY workspace/apps/server/ ./

# No app-local bun.lock (workspace uses repo-root lock); resolve deps at image build time.
RUN bun install

ENV NODE_ENV=production

EXPOSE 8080

CMD ["bun", "src/main.ts"]
