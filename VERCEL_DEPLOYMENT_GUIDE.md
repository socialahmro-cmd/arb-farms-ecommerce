# Vercel Deployment & Database Setup Guide

Your e-commerce website is currently equipped with a powerful, serverless backend designed to run on Vercel. All the code (API routes, SQL queries, and frontend integrations) is already written. 

To bring this live and activate the real backend (replacing the local demo mode), follow these exact steps.

---

### Step 1: Push Your Code to GitHub
Vercel works best when it connects directly to your GitHub repository. Every time you push an update to GitHub, Vercel will automatically rebuild and deploy your website.

1. Open your terminal in your project folder (`organic-websiste`).
2. Run the following commands to initialize Git and commit your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit with Vercel backend"
   ```
3. Go to [GitHub.com](https://github.com/), create a new repository (name it something like `arb-farms-ecommerce`).
4. Copy the repository URL provided by GitHub and push your local code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/arb-farms-ecommerce.git
   git branch -M main
   git push -u origin main
   ```

---

### Step 2: Import the Project into Vercel
Now that your code is on GitHub, let's deploy it.

1. Go to [Vercel.com](https://vercel.com/) and log in (or sign up using your GitHub account).
2. On your Vercel dashboard, click the **"Add New..."** button and select **"Project"**.
3. You will see a list of your GitHub repositories. Find `arb-farms-ecommerce` and click **"Import"**.
4. In the configuration screen, leave all the default settings as they are (Vercel will automatically detect that you are using Node.js API serverless functions).
5. Click **"Deploy"**.
6. Wait 1-2 minutes. Once finished, Vercel will give you a live production URL (e.g., `https://arb-farms-ecommerce.vercel.app`).

---

### Step 3: Provision Vercel Postgres (The Database)
Currently, your website is live but the API doesn't have a database to talk to. Let's create one.

1. In your Vercel Dashboard, navigate to your newly deployed project.
2. Click on the **"Storage"** tab in the top navigation menu.
3. Click **"Create Database"** and select **"Postgres"**.
4. Accept the terms, give your database a name (e.g., `arb-farms-db`), and select a region (choose a region closest to your target audience).
5. Click **"Create"**.
6. Vercel will ask if you want to connect this database to your project environments (Production, Preview, Development). Ensure they are all checked and click **"Connect"**.
   *(Note: Vercel instantly injects all the secret `POSTGRES_URL` environment variables into your project behind the scenes. You don't have to copy-paste anything!)*

---

### Step 4: Provision Vercel Blob (For Receipt Uploads)
Your customer portal allows users to upload transfer receipts. We need storage for those files.

1. Stay in the **"Storage"** tab of your Vercel project.
2. Click **"Create Database"** again, but this time select **"Blob"**.
3. Name your Blob store (e.g., `arb-farms-receipts`) and select the region.
4. Click **"Create"**.
5. Connect it to your Production, Preview, and Development environments just like you did with Postgres.

---

### Step 5: Initialize Your SQL Tables
Your database is connected, but it is currently empty. I wrote a script to automatically build your `users`, `orders`, and `order_items` tables.

1. Open a new tab in your browser.
2. Go to your live Vercel domain and append `/api/setup` to the end of it.
   **Example:** `https://arb-farms-ecommerce.vercel.app/api/setup`
3. Hit Enter.
4. If successful, you will see a white screen with raw text that says: 
   `{"message":"Database tables created successfully!"}`

---

### 🎉 You Are Done!
Your website is now a fully functional, cloud-backed e-commerce store!

**What happens now?**
* When a user checks out, the frontend will contact `/api/checkout`, which will save the data into Vercel Postgres.
* When a user logs in via `account.html`, it will verify their PIN directly against your Postgres `users` table.
* If a database connection fails for any reason during development, my code will gracefully fall back to "local demo mode" so your website never crashes. 

**Pro-Tip for Local Development:**
If you want to test the real database on your local computer (e.g., `localhost`), open your terminal and run:
```bash
npx vercel link
npx vercel env pull .env.development.local
npx vercel dev
```
This downloads your database secrets to your machine and runs a local server that connects directly to your cloud database!
