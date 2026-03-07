
# Deployment Guide for Writer's Chronicle

This guide will help you deploy your Next.js project to your custom domain: **https://blog.souravhalder.tech**

## Recommended Method: Vercel (Easiest & Free)

Since this project is built with Next.js, Vercel is the best platform for deployment.

### 1. Push Code to GitHub
First, ensure your project is pushed to a GitHub repository.
If you haven't initialized git yet:
```bash
git init
git add .
git commit -m "Initial commit"
# Create a repository on GitHub, then link it:
git remote add origin https://github.com/YOUR_USERNAME/writer-chronicle.git
git push -u origin main
```

### 2. Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) and sign up/login.
2. Click **"Add New..."** -> **"Project"**.
3. Import your GitHub repository (`writer-chronicle`).
4. In the **Configure Project** screen:
   - **Framework Preset:** Next.js (should be auto-detected)
   - **Root Directory:** `./` (default)
   - **Environment Variables:** You MUST add these variables:
     - `MONGODB_URI`: Your MongoDB connection string (e.g., from MongoDB Atlas)
     - `NEXT_PUBLIC_BASE_URL`: `https://blog.souravhalder.tech`
     - `EMAIL_SERVICE`: `gmail` (or your provider)
     - `EMAIL_USER`: Your email address for notifications
     - `EMAIL_PASS`: Your email app password
5. Click **Deploy**.

### 3. Connect Custom Domain
1. Once deployed, go to your project dashboard on Vercel.
2. Click on **Settings** -> **Domains**.
3. Enter `blog.souravhalder.tech` and click **Add**.
4. Vercel will give you DNS records (usually a **CNAME** record pointing to `cname.vercel-dns.com`).
5. Go to your domain registrar (where you bought `souravhalder.tech`) and add the CNAME record for the subdomain `blog`.

---

## Alternative Method: VPS (DigitalOcean/AWS/Linode)

If you prefer self-hosting on a Linux server (Ubuntu recommended).

### 1. Prepare Server
Ensure Node.js 18+ and MongoDB are installed on your server.

### 2. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/writer-chronicle.git
cd writer-chronicle
npm install
```

### 3. Build & Start
Create a `.env.local` file with your environment variables.
```bash
npm run build
npm start
```
The app will run on `http://localhost:3000`.

### 4. Setup PM2 (Process Manager)
To keep the app running in the background:
```bash
npm install -g pm2
pm2 start npm --name "writer-blog" -- start
pm2 save
```

### 5. Setup Nginx (Reverse Proxy)
Install Nginx and configure it to forward traffic from your domain to port 3000.
```nginx
server {
    listen 80;
    server_name blog.souravhalder.tech;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Then secure it with SSL using Certbot:
```bash
sudo certbot --nginx -d blog.souravhalder.tech
```

---

## Database Note (Important)

For production, **do not use a local MongoDB URL** (like `mongodb://localhost:27017`).
Use a cloud-hosted MongoDB service like **MongoDB Atlas** (free tier available).
1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Get the connection string (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/...`).
3. Use this string as your `MONGODB_URI` environment variable.
