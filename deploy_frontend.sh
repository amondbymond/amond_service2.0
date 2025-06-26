#!/bin/bash
source .env.deploy

echo "🔨 프론트 빌드 시작..."
cd frontend || exit 1
npm run build || exit 1
cd ..

echo "🚀 S3 업로드 중..."
aws s3 rm s3://$S3_BUCKET_NAME/ --recursive --region $AWS_REGION --profile $AWS_PROFILE
aws s3 sync frontend/out/ s3://$S3_BUCKET_NAME/ --region $AWS_REGION --profile $AWS_PROFILE

echo "🌐 CloudFront 캐시 무효화 중..."
INVALIDATION_OUTPUT=$(aws cloudfront create-invalidation \
  --distribution-id $CLOUDFRONT_DIST_ID \
  --paths "/*" \
  --profile $AWS_PROFILE)

echo "$INVALIDATION_OUTPUT"

if [[ $? -ne 0 ]]; then
  echo "❌ CloudFront 캐시 무효화 실패"
  exit 1
fi

echo "✅ 프론트 배포 완료!"