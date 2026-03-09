# 💰 How to Set Up Google AdSense (Earn Money from Ads)

## What is AdSense?
Google AdSense shows ads on your website. When visitors see or click the ads, **Google pays you**. It's free to join and the most popular way to earn from websites/games.

---

## Step 1 — Sign Up for AdSense

1. Go to **[adsense.google.com](https://adsense.google.com)**
2. Sign in with your **Google account**
3. Enter your website URL: `https://aesthetic-block-master.vercel.app` (from Step 5 in DEPLOY.md)
4. Fill in your country and payment details (your bank for receiving money)
5. Click **"Start using AdSense"**

> ⚠️ **Google reviews your site before approving** — this takes 1–14 days.
> Make sure your game is already deployed and live before applying!

---

## Step 2 — Get Your Publisher ID

After approval:
1. In AdSense dashboard → go to **Account → Account information**
2. Copy your **Publisher ID** — looks like: `ca-pub-1234567890123456`

---

## Step 3 — Add Your Publisher ID to the Game

1. Find the `.env.example` file in your project folder.
2. Rename it to `.env` (or add it directly in your Vercel project environment variables).
3. Open the file and replace `ca-pub-your_adsense_id_here` with your real ID:
   ```env
   VITE_ADSENSE_ID=ca-pub-1234567890123456
   ```
4. Save the file.
5. Push to GitHub → Vercel redeploys automatically using your newly provided Variable.
6. **Ads will start appearing in your game!** 🎉

---

## How Much Can You Earn?

| Daily Players | Estimated Monthly Earnings |
|---|---|
| 100 | $1 – $5 |
| 1,000 | $10 – $50 |
| 10,000 | $100 – $500 |
| 100,000 | $1,000 – $5,000 |

> 💡 **Tip**: Share your game everywhere to get more players!
> More players = more ad views = more money.

---

## When Do You Get Paid?
- Google pays when your earnings reach **$100**
- Paid **monthly** via bank transfer / cheque
- No minimum time requirement — just reach the $100 threshold
