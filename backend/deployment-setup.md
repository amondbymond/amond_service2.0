# Image Scraper Deployment Setup Guide

## Problem

The image scraper works locally but fails with 500 errors in deployment due to missing system dependencies and configuration issues.

## Solutions

### 1. Environment Variables

Make sure these environment variables are set in your deployment environment:

```bash
# Required for OpenAI integration
OPENAI_API_KEY=your_openai_api_key_here

# Required for YouTube scraping
YOUTUBE_API_KEY=your_youtube_api_key_here

# Optional: Path to Chrome binary (if using custom Chrome installation)
CHROME_BIN=/usr/bin/google-chrome
```

### 2. System Dependencies for Puppeteer

#### For Ubuntu/Debian:

```bash
sudo apt-get update
sudo apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libxss1 \
    libxtst6 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libdrm2 \
    libgbm1 \
    libasound2
```

#### For CentOS/RHEL:

```bash
sudo yum install -y \
    pango.x86_64 \
    libXcomposite.x86_64 \
    libXcursor.x86_64 \
    libXdamage.x86_64 \
    libXext.x86_64 \
    libXi.x86_64 \
    libXtst.x86_64 \
    cups-libs.x86_64 \
    libXScrnSaver.x86_64 \
    libXrandr.x86_64 \
    GConf2.x86_64 \
    alsa-lib.x86_64 \
    atk.x86_64 \
    gtk3.x86_64 \
    ipa-gothic-fonts \
    xorg-x11-fonts-100dpi \
    xorg-x11-fonts-75dpi \
    xorg-x11-utils \
    xorg-x11-fonts-cyrillic \
    xorg-x11-fonts-Type1 \
    xorg-x11-fonts-misc
```

#### For Alpine Linux (Docker):

```bash
apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont
```

### 3. Docker Configuration (if using Docker)

If you're using Docker, add this to your Dockerfile:

```dockerfile
# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Set Chrome binary path
ENV CHROME_BIN=/usr/bin/google-chrome
```

### 4. Alternative: Use Puppeteer with Chrome AWS Lambda

If you're deploying to AWS Lambda or similar serverless environments, consider using `puppeteer-core` with a Chrome binary:

```bash
npm uninstall puppeteer
npm install puppeteer-core chrome-aws-lambda
```

Then update the image scraper to use:

```typescript
import puppeteer from "puppeteer-core";
import chromium from "chrome-aws-lambda";

const browser = await puppeteer.launch({
  args: chromium.args,
  defaultViewport: chromium.defaultViewport,
  executablePath: await chromium.executablePath,
  headless: chromium.headless,
});
```

### 5. Testing the Fix

After implementing these changes:

1. **Check environment variables:**

   ```bash
   echo $OPENAI_API_KEY
   echo $YOUTUBE_API_KEY
   ```

2. **Test Puppeteer installation:**

   ```javascript
   const puppeteer = require("puppeteer");

   (async () => {
     try {
       const browser = await puppeteer.launch();
       console.log("Puppeteer works!");
       await browser.close();
     } catch (error) {
       console.error("Puppeteer failed:", error);
     }
   })();
   ```

3. **Monitor logs:**
   The updated code now includes detailed logging. Check your deployment logs for specific error messages.

### 6. Common Deployment Platforms

#### Heroku:

- Add buildpack: `heroku buildpacks:add --index 1 https://github.com/heroku/heroku-buildpack-google-chrome`
- Set environment variables in Heroku dashboard

#### AWS EC2:

- Install dependencies using the commands above
- Set environment variables in your deployment script

#### Docker:

- Use the Dockerfile configuration above
- Pass environment variables via `-e` flags or docker-compose

#### Vercel/Netlify:

- These platforms may not support Puppeteer. Consider using a different approach or moving to a VPS.

## Troubleshooting

### Error: "Failed to launch browser"

- Install missing system dependencies
- Check if Chrome/Chromium is installed
- Verify `CHROME_BIN` environment variable

### Error: "ENOTFOUND" or "ECONNREFUSED"

- Check network connectivity
- Verify the target URL is accessible
- Check firewall settings

### Error: "OpenAI API key is not configured"

- Set the `OPENAI_API_KEY` environment variable
- Restart your application after setting the variable

### Error: "Request timed out"

- Increase timeout values in the code
- Check if the target website is slow or blocking requests
