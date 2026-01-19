# --- STAGE 2: Setup PocketBase ---
FROM alpine:latest
RUN apk add --no-cache unzip ca-certificates

WORKDIR /pb
# Download PocketBase
ADD https://github.com/pocketbase/pocketbase/releases/download/v0.22.19/pocketbase_0.22.19_linux_amd64.zip /tmp/pb.zip
RUN unzip /tmp/pb.zip -d /pb/

# Create the folder explicitly to avoid permission issues
RUN mkdir -p /pb/pb_public

# Copy the built React app
COPY --from=build-stage /app/dist /pb/pb_public

EXPOSE 8080

# Use the absolute path to the binary to ensure it executes
CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8080", "--publicDir=/pb/pb_public", "--indexFallback"]
``` [cite: 3]

---

### 2. Why you are still getting 405 / Redirects
If you have deployed this and it *still* redirects to the home page when you hit `/_/`, it means **Railway is not using your Dockerfile.**

1.  **Check the "Build Logs" in Railway:** Look at the very start of the log. Does it say "Building Dockerfile" or does it say "Nixpacks"? 
2.  If it says **Nixpacks**, Railway is ignoring your `CMD` [cite: 3] and your `--publicDir` flag. It's just serving your `dist` folder as a static site, which is why `/api` gives a **405 (Method Not Allowed)**—you can't POST to a static file.
3.  **To fix this:** Go to Railway **Settings** -> **Build** and change the **Build Tool** from "Automatic" or "Nixpacks" to **Docker**.

---

### 3. The Final "PocketBase" Manual Step
Once the build is actually running via Docker:
* **The Redirect Fix:** If the `--indexFallback` flag is working, visiting `https://classabc.up.railway.app/_/` **must** show the PocketBase admin login[cite: 3].
* **The 405 Fix:** Once you are in the Admin panel, you **must** create the admin account. PocketBase often blocks `POST` requests to the `users` collection until an admin exists to manage the database schema.


### Summary of what to do right now:
1.  **Change Railway Build Tool to "Docker"** in the settings.
2.  **Update the Dockerfile** with the `WORKDIR /pb` and `mkdir` lines I showed above to ensure the files land in the right spot.
3.  **Push the code.**

**Once the build finishes, try to visit `https://classabc.up.railway.app/api/health`. Does it give you a JSON object or the landing page?**