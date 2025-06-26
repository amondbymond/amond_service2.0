#!/bin/bash

# Webhook 기반 배포 스크립트 (GitHub Webhook 또는 수동 트리거용)

set -e

# 환경 변수 로드
if [ -f ".env.deploy" ]; then
    source .env.deploy
else
    echo "❌ .env.deploy 파일이 없습니다."
    exit 1
fi

# 로그 함수
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# 배포 시작
log "🚀 Webhook 배포 시작"

# 1. 최신 코드 가져오기
log "📥 최신 코드 가져오기"
cd /home/ec2-user/$EC2_FOLDER_NAME || {
    log "❌ 프로젝트 디렉토리를 찾을 수 없습니다"
    exit 1
}

# Git 저장소가 있는지 확인
if [ ! -d ".git" ]; then
    log "❌ Git 저장소가 없습니다. 먼저 코드를 클론해주세요."
    exit 1
fi

# 최신 코드 pull
git pull origin main || {
    log "❌ Git pull 실패"
    exit 1
}

# 2. 백엔드 배포
log "🔧 백엔드 배포 시작"
cd backend || {
    log "❌ backend 디렉토리를 찾을 수 없습니다"
    exit 1
}

# 의존성 설치
log "📦 의존성 설치"
npm install --production

# PM2 프로세스 재시작
log "🔄 PM2 프로세스 재시작"
pm2 restart $PM2_PROCESS_NAME || pm2 start npm --name "$PM2_PROCESS_NAME" -- start

# PM2 상태 저장
pm2 save

log "✅ 백엔드 배포 완료"

# 3. 프론트엔드 배포 (선택사항)
if [ "$DEPLOY_FRONTEND" = "true" ]; then
    log "🎨 프론트엔드 배포 시작"
    cd ../frontend || {
        log "❌ frontend 디렉토리를 찾을 수 없습니다"
        exit 1
    }
    
    # 의존성 설치
    log "📦 프론트엔드 의존성 설치"
    npm install
    
    # 빌드
    log "🔨 프론트엔드 빌드"
    npm run build
    
    # S3 업로드
    log "☁️ S3 업로드"
    aws s3 rm s3://$S3_BUCKET_NAME/ --recursive --region $AWS_REGION --profile $AWS_PROFILE
    aws s3 sync out/ s3://$S3_BUCKET_NAME/ --region $AWS_REGION --profile $AWS_PROFILE
    
    # CloudFront 캐시 무효화
    log "🔄 CloudFront 캐시 무효화"
    aws cloudfront create-invalidation \
        --distribution-id $CLOUDFRONT_DIST_ID \
        --paths "/*" \
        --profile $AWS_PROFILE
    
    log "✅ 프론트엔드 배포 완료"
fi

log "🎉 전체 배포 완료!"

# 배포 상태 확인
log "📊 배포 상태 확인"
pm2 status

# 웹훅 응답 (HTTP 서버에서 사용할 경우)
if [ "$WEBHOOK_RESPONSE" = "true" ]; then
    echo "HTTP/1.1 200 OK"
    echo "Content-Type: application/json"
    echo ""
    echo '{"status": "success", "message": "Deployment completed successfully", "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}'
fi 