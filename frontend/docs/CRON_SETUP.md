# DormFlow - Cron Job Setup Guide

## Overview
DormFlow includes an automated cron job that checks for overdue bills daily and sends notifications via Telegram and email.

## Cron Job Endpoint

**URL:** `https://your-domain.com/api/cron/check-overdue`  
**Method:** `POST`  
**Authentication:** Bearer token (via `Authorization` header)

## Setup Instructions

### 1. Set Environment Variables

Add the following variables to your `.env` file:

```env
# Cron Job Security
CRON_SECRET=your-secure-cron-token

# Telegram Configuration (Optional)
TELEGRAM_BOT_TOKEN=your-telegram-bot-token
TELEGRAM_CHAT_ID=your-telegram-chat-id
```

### 2. Get Telegram Bot Token

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the instructions to create a new bot
4. Copy the Bot Token

### 3. Get Telegram Chat ID

1. Open your Telegram bot
2. Send a message to the bot
3. Visit: `https://api.telegram.org/botYOUR_BOT_TOKEN/getUpdates`
4. Find your Chat ID in the response

### 4. Configure Cron Job with Vercel

#### Option A: Using Vercel Cron Jobs (Recommended)

Add to `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-overdue",
      "schedule": "0 9 * * *"
    }
  ]
}
```

The schedule `0 9 * * *` means: Run at 9:00 AM every day (UTC)

#### Option B: Using External Service (e.g., EasyCron)

1. Go to https://www.easycron.com
2. Create an account and sign in
3. Click "Add a Cron Job"
4. Enter the URL: `https://your-domain.com/api/cron/check-overdue`
5. Set cron expression: `0 9 * * *` (daily at 9 AM UTC)
6. Add HTTP Header:
   ```
   Authorization: Bearer your-secure-cron-token
   ```
7. Click "Save"

#### Option C: Using GitHub Actions

Create `.github/workflows/cron-check-overdue.yml`:

```yaml
name: Check Overdue Bills

on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC

jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: Check overdue bills
        run: |
          curl -X POST https://your-domain.com/api/cron/check-overdue \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            -H "Content-Type: application/json"
```

## Notification Flow

### 1. Cron Job Execution
- Triggers at scheduled time
- Fetches all bills with overdue status
- Calculates days overdue

### 2. Send Notifications
For each overdue bill:
- **Telegram:** Direct message to admin with bill details
- **Email:** Message to tenant (if configured)

### 3. Response Logging
All notifications are logged with:
- Bill ID
- Notification method (telegram/email)
- Status (success/failed)
- Timestamp

## Response Format

```json
{
  "success": true,
  "message": "Overdue bills checked and notifications sent",
  "totalBills": 2,
  "notifications": 2,
  "timestamp": "2026-03-17T09:00:00.000Z"
}
```

## Troubleshooting

### Cron job not triggering
- Check `vercel.json` syntax
- Verify environment variables are set
- Check Vercel dashboard logs

### Telegram notifications not sending
- Verify `TELEGRAM_BOT_TOKEN` is correct
- Ensure `TELEGRAM_CHAT_ID` is valid
- Test bot manually: Send message to bot first
- Check API response in logs

### Email notifications not sending
- Implement email service (SendGrid, Resend, etc.)
- Add email service API key to environment
- Update cron route with email configuration

## Customization

### Change Schedule
Modify `vercel.json` cron expression:
- `0 9 * * *` - Daily at 9 AM
- `0 8,14 * * *` - At 8 AM and 2 PM
- `0 9 * * MON` - Every Monday at 9 AM
- `*/30 * * * *` - Every 30 minutes

### Add More Notification Channels
Edit `/app/api/cron/check-overdue/route.ts` to add:
- SMS notifications (Twilio)
- WhatsApp messages
- In-app notifications
- Mobile push notifications

### Database Integration
Replace mock data with real database queries:
```typescript
// Example: Get overdue bills from database
const overdueBills = await db.bills.findMany({
  where: {
    status: 'overdue',
    daysOverdue: { gte: 1 }
  }
})
```

## Best Practices

1. **Security:** Use strong, random `CRON_SECRET`
2. **Rate Limiting:** Don't call external APIs too frequently
3. **Error Handling:** Log all errors for debugging
4. **Notifications:** Avoid sending duplicate messages
5. **Schedule:** Run during off-peak hours (9 AM recommended)
6. **Testing:** Test manually before setting schedule

## Monitoring

Check logs in:
- **Vercel Dashboard:** Deployments → Cron Jobs
- **Telegram:** Messages in configured chat
- **Email:** Check tenant/admin inboxes

## Support

For issues or questions:
1. Check this documentation
2. Review Vercel Cron Jobs docs
3. Check Telegram Bot API status
4. Review application logs
