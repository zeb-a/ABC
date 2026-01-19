# --- STAGE 2: Setup PocketBase ---
FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates

# Set the Working Directory - THIS IS THE SECRET SAUCE
WORKDIR /pb

# Download PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.19/pocketbase_0.22.19_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/ && rm /tmp/pb.zip

# Ensure the folder exists before copying
RUN mkdir -p /pb/pb_public

# Copy the built React app from Stage 1
# Double check your React project: is it 'dist' or 'build'?
COPY --from=build-stage /app/dist /pb/pb_public

# Standard Railway port
EXPOSE 8080

# Start PocketBase with EXPLICIT relative paths
# This forces PocketBase to look at the exact folder we copied the React files into
CMD ["./pocketbase", "serve", "--http=0.0.0.0:8080", "--publicDir=./pb_public", "--indexFallback"]