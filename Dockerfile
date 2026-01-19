# --- STAGE 1: Build the React Frontend ---
FROM node:20-alpine AS build_stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
[cite_start]RUN npm run build [cite: 2]

# --- STAGE 2: Setup PocketBase ---
FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates

# Set the working directory
WORKDIR /pb

# Download and unzip PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.19/pocketbase_0.22.19_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip

# Create the public folder
RUN mkdir -p /pb/pb_public

# FIX: Using underscore to ensure the builder recognizes the local stage
COPY --from=build_stage /app/dist /pb/pb_public

EXPOSE 8080

# [cite_start]Start command [cite: 3]
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080", "--publicDir=./pb_public", "--indexFallback"]