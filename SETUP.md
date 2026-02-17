# Setup Guide - OpenAI API Key

## Quick Setup (Recommended)

Run the setup script:

```powershell
.\setup_api_key.ps1
```

This will:
1. Prompt you for your OpenAI API key
2. Set it permanently as a User environment variable
3. Make it available immediately in your current session

**Get your API key**: https://platform.openai.com/api-keys

---

## Manual Setup Options

### Option 1: PowerShell Command (Permanent)

```powershell
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', 'sk-your-key-here', 'User')
```

**Note**: Restart your terminal/IDE after this command.

### Option 2: Windows GUI (Permanent)

1. Press `Win + R`
2. Type: `sysdm.cpl` and press Enter
3. Click "Advanced" tab
4. Click "Environment Variables" button
5. Under "User variables", click "New"
6. Variable name: `OPENAI_API_KEY`
7. Variable value: `sk-your-key-here`
8. Click OK on all dialogs

**Note**: Restart your terminal/IDE after setting.

### Option 3: Temporary (Current Session Only)

```powershell
$env:OPENAI_API_KEY = "sk-your-key-here"
```

**Note**: This only lasts until you close PowerShell.

---

## Verify Setup

Check if the key is set:

```powershell
$env:OPENAI_API_KEY
```

Should output: `sk-your-key-here`

---

## Test the Integration

### 1. Start the server

```powershell
python main.py
```

### 2. Test NLP endpoint (in another terminal)

```powershell
$body = @{
    text = "The pizza arrived completely cold and was missing toppings"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8000/nlp/extract" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Expected Results

**With API key set correctly:**
```json
{
  "food_quality_issue": true,
  "missing_item": true,
  "temperature_problem": true,
  "confidence": 0.95,
  ...
}
```
Notice `confidence > 0` - this means the API is working!

**Without API key (fallback mode):**
```json
{
  "food_quality_issue": false,
  "missing_item": false,
  "temperature_problem": false,
  "confidence": 0.0,
  ...
}
```
Notice `confidence: 0.0` - system still works but LLM features disabled.

---

## Troubleshooting

### "Key not found" after setting

**Solution**: Restart your terminal/IDE. Environment variables need a fresh session.

```powershell
# Close PowerShell and open a new one, then check:
$env:OPENAI_API_KEY
```

### "Permission denied" when running script

**Solution**: Allow script execution:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then try again:
```powershell
.\setup_api_key.ps1
```

### Can't find setup_api_key.ps1

**Solution**: Make sure you're in the project directory:

```powershell
cd C:\Users\PcVIP\PycharmProjects\RefundAssistant
.\setup_api_key.ps1
```

### API key not working / Getting errors

**Check**:
1. Key starts with `sk-`
2. Key is valid on OpenAI platform
3. Account has credits/billing enabled

**Test manually**:
```powershell
$env:OPENAI_API_KEY = "sk-your-key-here"
python -c "import os; print('Key:', os.getenv('OPENAI_API_KEY')[:10] + '...')"
```

---

## Security Best Practices

✅ **DO**:
- Use environment variables
- Keep key private
- Rotate keys periodically
- Monitor usage on OpenAI dashboard

❌ **DON'T**:
- Commit keys to Git
- Share keys publicly
- Hardcode keys in code
- Use same key for dev/prod

---

## Removing the API Key

If you need to remove the key:

```powershell
[System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', $null, 'User')
```

Or manually delete it from Environment Variables (Win + R → sysdm.cpl).

---

## Cost Information

- **Model**: gpt-3.5-turbo
- **Cost**: ~$0.0015 per request
- **Caching**: Reduces costs for repeated text
- **Monthly estimate**: Depends on usage

**Monitor costs**: https://platform.openai.com/usage

---

## Working Without API Key

The system is fully functional without an API key:
- ✅ All traditional scoring works
- ✅ All endpoints operational
- ✅ Demo cases work
- ⚠️ LLM text features return neutral values (0/False)

So you can develop and test without the key, and add it later for enhanced text analysis.

---

## Need Help?

1. **Get API key**: https://platform.openai.com/api-keys
2. **OpenAI docs**: https://platform.openai.com/docs
3. **Check project docs**: See `NLP_INTEGRATION.md` for details

---

**Quick Start**: Just run `.\setup_api_key.ps1` and you're done! 🚀

