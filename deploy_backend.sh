#!/bin/bash
set -e  # 스크립트 실행 중 하나라도 실패하면 종료

source .env.deploy

# 변수 확인
echo "📌 환경 변수 확인 중..."
echo "EC2_HOST: $EC2_HOST"
echo "EC2_USER: $EC2_USER"
echo "EC2_FOLDER_NAME: $EC2_FOLDER_NAME"
echo "EC2_SSH_KEY: $EC2_SSH_KEY"
echo "PM2_PROCESS_NAME: $PM2_PROCESS_NAME"

# PEM 파일 권한 확인
if [ ! -f "$EC2_SSH_KEY" ]; then
  echo "❌ SSH 키 파일이 존재하지 않습니다: $EC2_SSH_KEY"
  exit 1
fi

chmod 400 "$EC2_SSH_KEY"

# 1. 백엔드 디렉토리 생성
echo "📦 EC2에 백엔드 디렉토리 생성 중..."
ssh -o StrictHostKeyChecking=no -i "$EC2_SSH_KEY" "$EC2_USER@$EC2_HOST" << EOF
  mkdir -p /home/ec2-user/$EC2_FOLDER_NAME/backend
EOF

# 2. 코드 전송
echo "📤 EC2에 코드 전송 중..."
rsync -avz --exclude 'node_modules' \
  -e "ssh -i $EC2_SSH_KEY -o StrictHostKeyChecking=no" \
  backend/ "$EC2_USER@$EC2_HOST:/home/ec2-user/$EC2_FOLDER_NAME/backend"

# 3. PM2 프로세스 재시작
echo "🔄 PM2 프로세스 재시작 중..."
ssh -o StrictHostKeyChecking=no -i "$EC2_SSH_KEY" "$EC2_USER@$EC2_HOST" << EOF
  cd /home/ec2-user/$EC2_FOLDER_NAME/backend
  npm install
  pm2 restart $PM2_PROCESS_NAME || pm2 start npm --name "$PM2_PROCESS_NAME" -- start
EOF

echo "✅ 백엔드 배포 완료!"
