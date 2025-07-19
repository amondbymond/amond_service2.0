# AWS Amplify Setup for Frontend

## Option 1: Direct Git Integration (Recommended)

### Initial Setup (One-time)

1. **Go to AWS Amplify Console**
   ```
   https://console.aws.amazon.com/amplify/
   ```

2. **Create New App**
   - Click "New app" → "Host web app"
   - Choose "GitHub" as your Git provider
   - Authorize AWS Amplify to access your GitHub account
   - Select your repository: `Amond_new`
   - Select branch: `main`

3. **Configure Build Settings**
   - App name: `amond-frontend`
   - Environment: Production
   - Build and test settings will auto-detect from `amplify.yml`
   - Make sure it shows "Framework: Next.js - SSR"

4. **Environment Variables**
   Click "Advanced settings" and add all your frontend environment variables:
   ```
   NEXT_PUBLIC_API_SERVER_URL=https://api.mond.io.kr
   NEXT_PUBLIC_WEB_SERVER_URL=https://service.mond.io.kr
   # Add all other NEXT_PUBLIC_ variables from your .env files
   ```

5. **Save and Deploy**
   - Click "Save and deploy"
   - First deployment takes 10-15 minutes

### Result
- Amplify will automatically deploy on every push to `main`
- You'll get a URL like: `https://main.d1234567890.amplifyapp.com`
- You can add custom domain later

### Update GitHub Actions
Since Amplify handles frontend deployment, update your `deploy.yml`:

```yaml
# Remove these frontend-related steps:
# - Build Frontend
# - Deploy Frontend to S3
# - Invalidate CloudFront Cache

# Keep only backend deployment steps
```

---

## Option 2: Keep GitHub Actions + Trigger Amplify

If you want to keep using GitHub Actions, you can trigger Amplify builds:

### Setup Amplify App (Same as Option 1)
But disable automatic builds:
- In Amplify Console → App settings → General
- Turn off "Enable branch auto build"

### Add Amplify Deployment to GitHub Actions

```yaml
- name: Trigger Amplify Deployment
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    AWS_REGION: ${{ secrets.AWS_REGION }}
  run: |
    # Get Amplify App ID (you'll need to add this as a secret)
    APP_ID=${{ secrets.AMPLIFY_APP_ID }}
    BRANCH_NAME="main"
    
    # Start deployment
    JOB_ID=$(aws amplify start-job \
      --app-id $APP_ID \
      --branch-name $BRANCH_NAME \
      --job-type RELEASE \
      --query 'jobSummary.jobId' \
      --output text)
    
    echo "Started Amplify deployment: $JOB_ID"
    
    # Optionally wait for completion
    aws amplify get-job \
      --app-id $APP_ID \
      --branch-name $BRANCH_NAME \
      --job-id $JOB_ID
```

---

## Custom Domain Setup

After deployment succeeds:

1. Go to Amplify Console → Your App → Domain management
2. Add domain → Enter your domain: `service.mond.io.kr`
3. Follow DNS configuration instructions
4. SSL certificate is automatically provisioned

## Important Notes

- The `amplify.yml` file in your frontend directory configures the build
- Environment variables must be prefixed with `NEXT_PUBLIC_` to be available in the browser
- Server-side environment variables (without prefix) are also supported
- Amplify provides built-in monitoring, logs, and performance metrics
- You get automatic preview deployments for pull requests

## Migration Checklist

- [x] Create `amplify.yml` in frontend directory
- [ ] Set up Amplify app in AWS Console
- [ ] Configure environment variables
- [ ] Test deployment
- [ ] Update DNS to point to Amplify
- [ ] Remove S3/CloudFront resources (after confirming Amplify works)
- [ ] Update GitHub Actions workflow