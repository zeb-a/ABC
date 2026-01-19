# --- STAGE 1: Build the React Frontend ---
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
# This creates the /dist folder on Railway's server
RUN npm run build

# --- STAGE 2: Setup PocketBase ---
FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates

# Download PocketBase (Using version 0.22.19 as an example)
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.19/pocketbase_0.22.19_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# Copy the built React app from Stage 1 into PocketBase's public folder
COPY --from=build-stage /app/dist /pb/pb_public

# Standard Railway port
EXPOSE 8080

# Start PocketBase
# --http=0.0.0.0:8080 makes it listen to Railway's network
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080"]