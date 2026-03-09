# 📊 Google Analytics 4 — Setup Guide

This guide explains how to activate Google Analytics 4 (GA4) on your GlitchCraft deployment in under 5 minutes.

---

## Step 1 — Create a GA4 Property

1. Go to **[analytics.google.com](https://analytics.google.com)**
2. Sign in with your Google account
3. Click **"Start measuring"** → Create an Account
4. Enter an account name (e.g. "GlitchCraft")
5. Create a **Property** → select **Web**
6. Enter your Vercel URL (e.g. `glitchcraft-tetris.vercel.app`)
7. Click **"Create stream"**
8. Copy the **Measurement ID** — it looks like `G-XXXXXXXXXX`

---

## Step 2 — Add the Environment Variable to Vercel

1. Go to your **Vercel Dashboard** → select the GlitchCraft project
2. Click **Settings → Environment Variables**
3. Add a new variable:
   - **Key:** `VITE_GA_ID`
   - **Value:** `G-XXXXXXXXXX` ← your actual Measurement ID
   - **Environments:** Production ✅, Preview ✅, Development ❌
4. Click **Save**
5. Go to **Deployments** → click the 3-dot menu on the latest deploy → **Redeploy**

> That's it. GA4 is now live. No code changes needed.

---

## Step 3 — Verify It's Working

1. Open your live game URL in any browser
2. Go back to Google Analytics → **Realtime** tab
3. You should see yourself appear as an active user within 30 seconds ✅

---

## What Is Tracked (Automatically)

GA4 automatically tracks without any extra code:

| Event | Description |
|---|---|
| `page_view` | Every visit to the game URL |
| `session_start` | A new user session begins |
| `first_visit` | First time a user has ever visited |
| `user_engagement` | How long users actively play |

---

## For Local Development

**Do NOT set `VITE_GA_ID` in your local `.env`** — this prevents polluting your analytics data with your own development traffic.

If `VITE_GA_ID` is not set (or equals the placeholder `G-XXXXXXXXXX`), the GA scripts will load but not fire any data to a real property, so local dev is always clean.

---

## For the Buyer

When the buyer purchases the project, they should:
1. Create their own GA4 property
2. Set `VITE_GA_ID` to their own Measurement ID in their Vercel project
3. Redeploy

All historical data collected under your property stays with you — the buyer starts fresh with their own analytics.
