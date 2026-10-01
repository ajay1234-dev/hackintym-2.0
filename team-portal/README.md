# HackinTym'26 2.0 — Standalone Team Photo Portal

This directory contains a standalone, hostable web portal where participating teams can upload their team profile pictures/avatars to **Cloudinary** and have them automatically synced into the **HackinTym'26 2.0 Live Leaderboard** in real time!

---

## 🚀 How to Host This Separately

You can host this folder independently anywhere you like:

### Option 1: Double Click / Local Opening
Just double-click `index.html` to open it in Google Chrome, Microsoft Edge, or any browser. It connects directly to your live Firebase Firestore project and allows teams to upload their pictures immediately!

### Option 2: Deploy to GitHub Pages (Free)
1. Push this folder to a GitHub repository.
2. In Repository Settings -> **Pages**, choose the branch and folder (e.g. `/team-portal` or root).
3. Teams will get a direct link like `https://your-org.github.io/team-portal/`.

### Option 3: Deploy to Vercel / Netlify / Cloudflare Pages
Drag and drop this `team-portal` folder into [Netlify Drop](https://app.netlify.com/drop) or Vercel for an instant free HTTPS domain.

---

## ☁️ Cloudinary Configuration

To direct uploads to your own Cloudinary cloud:
1. Open `index.html` in an editor.
2. Find:
   ```javascript
   const cloudName = "your_cloud_name";
   const uploadPreset = "hackintime";
   ```
3. Replace with your Cloudinary Cloud Name and unsigned upload preset.
4. *Note:* If left as is, the portal automatically uses the built-in resilient client compression that stores the avatar directly in Firestore with zero setup!

---

## 🔗 Integrated In-App Route
This portal is also accessible inside the Next.js application at:
`http://localhost:3000/portal`
