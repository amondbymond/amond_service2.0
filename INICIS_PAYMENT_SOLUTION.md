# INICIS Payment Integration Solution for Static Export

## The Problem

1. **Static Export Limitation**: With `output: 'export'`, Next.js cannot handle POST requests or API routes
2. **INICIS V023 Error**: INICIS validates that returnUrl must be on the same domain as the request page
3. **INICIS Posts Data**: INICIS sends payment results via POST, which static pages cannot receive

## Solutions

### Option 1: Disable Static Export for Payment Pages (Recommended for Development)

Use the regular Next.js build for development and testing:
```bash
npm run build  # Regular build without static export
npm run start
```

For production with static export:
```bash
npm run build:static  # Static export for production
```

### Option 2: Use INICIS Mobile Web Integration

INICIS Mobile Web uses GET redirects instead of POST, which works with static sites:

1. Already implemented in `InicisPaymentSimple.tsx`
2. Uses redirect flow: Your Site → INICIS Mobile → Your Site (GET)
3. Works with static export

### Option 3: Server-Side Proxy (Production)

For production, set up a reverse proxy (nginx) to handle INICIS callbacks:

```nginx
location /payment/inicis-callback {
    proxy_pass http://backend:9988/payment/inicis/return;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

### Option 4: Hybrid Deployment

1. Deploy most pages as static to S3/CloudFront
2. Deploy payment pages to a server (Vercel, EC2, etc.)
3. Use subdomain for payment: `pay.service.mond.io.kr`

## Current Implementation Status

1. ✅ Payment pages created and working
2. ✅ Backend endpoints ready
3. ✅ INICIS test credentials configured
4. ❌ Static export blocks POST requests
5. ❌ V023 domain validation error with backend URLs

## Recommendation

For immediate testing and development:
1. Use `npm run dev` (development server with hot reload)
2. Or use `npm run build && npm run start` (production build without static export)

For production deployment:
1. Use INICIS Mobile Web integration (GET-based)
2. Or set up reverse proxy for INICIS callbacks
3. Or use hybrid deployment with payment on separate server

## Testing Instructions

1. Set up environment variables:
   ```bash
   NEXT_PUBLIC_INICIS_MID=INIBillTst
   NEXT_PUBLIC_INICIS_SIGNKEY=SU5JTElURV9UUklQTEVERVNfS0VZU1RS
   NEXT_PUBLIC_INICIS_URL=https://stgstdpay.inicis.com/stdjs/INIStdPay.js
   NEXT_PUBLIC_API_URL=http://localhost:9988
   ```

2. Run backend:
   ```bash
   cd backend
   npm run dev
   ```

3. Run frontend (without static export):
   ```bash
   cd frontend
   npm run dev  # or npm run build && npm run start
   ```

4. Test payment flow at http://localhost:3000/subscribe