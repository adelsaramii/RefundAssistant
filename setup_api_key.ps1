# Setup Script - Set OpenAI API Key Permanently
# This sets the OPENAI_API_KEY as a permanent User environment variable

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  OpenAI API Key Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for API key
Write-Host "Enter your OpenAI API Key (starts with 'sk-'):" -ForegroundColor Yellow
$apiKey = Read-Host

# Validate it's not empty
if ([string]::IsNullOrWhiteSpace($apiKey)) {
    Write-Host ""
    Write-Host "[ERROR] API key cannot be empty!" -ForegroundColor Red
    Write-Host "Get your key from: https://platform.openai.com/api-keys" -ForegroundColor Yellow
    exit 1
}

# Validate it starts with sk-
if (-not $apiKey.StartsWith("sk-")) {
    Write-Host ""
    Write-Host "[WARNING] API key should start with 'sk-'" -ForegroundColor Yellow
    Write-Host "Are you sure this is correct? (Y/N)" -ForegroundColor Yellow
    $confirm = Read-Host
    if ($confirm -ne "Y" -and $confirm -ne "y") {
        Write-Host "Setup cancelled." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Setting environment variable..." -ForegroundColor Green

try {
    # Set the environment variable permanently for the user
    [System.Environment]::SetEnvironmentVariable('OPENAI_API_KEY', $apiKey, 'User')
    
    # Also set it for the current session
    $env:OPENAI_API_KEY = $apiKey
    
    Write-Host ""
    Write-Host "[SUCCESS] API key has been set permanently!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The key is now available for:" -ForegroundColor Cyan
    Write-Host "  - Current session (immediate)" -ForegroundColor White
    Write-Host "  - Future sessions (permanent)" -ForegroundColor White
    Write-Host ""
    Write-Host "NOTE: You may need to restart your IDE/terminal for it to be" -ForegroundColor Yellow
    Write-Host "      recognized by other applications." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To verify it's set, run:" -ForegroundColor Cyan
    Write-Host '  $env:OPENAI_API_KEY' -ForegroundColor White
    Write-Host ""
    Write-Host "You can now run the server:" -ForegroundColor Cyan
    Write-Host "  python main.py" -ForegroundColor White
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "[ERROR] Failed to set environment variable: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Try running PowerShell as Administrator or set it manually:" -ForegroundColor Yellow
    Write-Host "  1. Press Win + R" -ForegroundColor White
    Write-Host "  2. Type: sysdm.cpl" -ForegroundColor White
    Write-Host "  3. Advanced tab > Environment Variables" -ForegroundColor White
    Write-Host "  4. Under User variables, click New" -ForegroundColor White
    Write-Host "  5. Name: OPENAI_API_KEY" -ForegroundColor White
    Write-Host "  6. Value: $apiKey" -ForegroundColor White
    Write-Host ""
    exit 1
}

