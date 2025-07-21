# Troubleshooting Guide

## Common Issues and Solutions

### 🚫 OpenAI Quota Exceeded (Error 429)

**Error Message:** "OpenAI quota exceeded. Please check your OpenAI billing and usage limits."

**Causes:**
- You've exceeded your OpenAI API usage limits
- Your account has insufficient credits
- You're on a free plan with limited usage

**Solutions:**
1. **Check your OpenAI usage:**
   - Go to [OpenAI Platform](https://platform.openai.com/usage)
   - Review your current usage and limits

2. **Add billing information:**
   - Go to [OpenAI Billing](https://platform.openai.com/account/billing)
   - Add a payment method if you haven't already

3. **Wait for quota reset:**
   - Free tier quotas reset monthly
   - Paid tier quotas may reset based on your plan

4. **Upgrade your plan:**
   - Consider upgrading to a paid plan for higher limits

### 🔑 Invalid API Key (Error 401)

**Error Message:** "Invalid OpenAI API key. Please check your API configuration."

**Solutions:**
1. **Verify your API key:**
   - Check that your API key starts with `sk-`
   - Ensure there are no extra spaces or characters

2. **Generate a new API key:**
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Update your `.env` file with the new key

3. **Restart the server:**
   ```bash
   npm start
   ```

### 🎵 Audio Format Issues (Error 400)

**Error Message:** "Audio format issue. Please try recording again with a clear voice."

**Solutions:**
1. **Try a different browser:**
   - Use Chrome, Firefox, or Safari (latest versions)

2. **Check microphone permissions:**
   - Allow microphone access when prompted
   - Check browser settings for microphone permissions

3. **Record shorter clips:**
   - Keep recordings under 2-3 minutes
   - Ensure clear, audible speech

### 🌐 Connection Issues (Error 503)

**Error Message:** "Unable to connect to OpenAI. Please check your internet connection."

**Solutions:**
1. **Check internet connection:**
   - Ensure stable internet connectivity
   - Try refreshing the page

2. **Check firewall/proxy settings:**
   - Ensure OpenAI API endpoints aren't blocked
   - Try disabling VPN temporarily

3. **Retry after some time:**
   - OpenAI services might be temporarily unavailable

## Testing Your Setup

### 1. Test API Key Validation
Visit: `http://localhost:3000/validate-api`

This will tell you if your API key is working without using quota.

### 2. Test Server Health
Visit: `http://localhost:3000/health`

This should return server status information.

### 3. Check Server Logs
Look at the terminal/console where you started the server for detailed error messages.

## Getting Help

### OpenAI Support Resources
- [OpenAI Documentation](https://platform.openai.com/docs)
- [OpenAI Community Forum](https://community.openai.com/)
- [OpenAI Status Page](https://status.openai.com/)

### Common Error Codes
- `400` - Bad Request (audio format, size, etc.)
- `401` - Unauthorized (invalid API key)
- `429` - Too Many Requests (quota exceeded)
- `500` - Internal Server Error (server-side issue)
- `503` - Service Unavailable (connection issues)

## Preventive Measures

1. **Monitor your usage regularly**
2. **Set up billing alerts in OpenAI dashboard**
3. **Test with short audio clips first**
4. **Keep your API key secure and private**
5. **Use the `/validate-api` endpoint before heavy usage**
