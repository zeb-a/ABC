FROM node:20-alpine AS build_stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates


WORKDIR /pb


ADD https://github.com/pocketbase/pocketbase/releases/download/v0.35.0/pocketbase_0.35.0_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip


RUN mkdir -p /pb/pb_public


COPY --from=build_stage /app/dist /pb/pb_public

EXPOSE 8080


CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080", "--publicDir=./pb_public", "--indexFallback"]