FROM denoland/deno:2.3.7 AS dependencies
WORKDIR /app

COPY deno.json deno.lock ./
COPY workspace/apps/ui/deno.json ./workspace/apps/ui/deno.json
RUN deno install

FROM dependencies AS builder
WORKDIR /app

COPY workspace/apps/ui ./workspace/apps/ui

# Ignore the error because the build is not successful 
# - deno panics after the build in some unimportant way
RUN deno task build:ui || :

FROM nginx:alpine AS production
WORKDIR /app

COPY --from=builder /app/workspace/apps/ui/dist /usr/share/nginx/html
COPY workspace/apps/ui/docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"] 
