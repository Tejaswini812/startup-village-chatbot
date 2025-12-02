# PowerShell script to push to GitHub
# Run this AFTER unarchiving the repository on GitHub

# Navigate to project directory
cd C:\Users\hp\OneDrive\Desktop\Chatbotnode\startup-village-county

# Check current status
Write-Host "Checking git status..." -ForegroundColor Yellow
git status

# Add all changes
Write-Host "Adding all changes..." -ForegroundColor Yellow
git add .

# Commit changes
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Update: Fixed backend routes, frontend API calls, MongoDB connection, and deployment configurations"

# Push to GitHub
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin master

# Verify
Write-Host "Verifying push..." -ForegroundColor Yellow
git status
git log --oneline -3

Write-Host "Done! Check GitHub to verify your changes are pushed." -ForegroundColor Green

