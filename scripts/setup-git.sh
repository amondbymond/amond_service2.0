#!/bin/bash

# Git 설정 및 GitHub Actions 배포 설정 스크립트

set -e

echo "🚀 Amond 프로젝트 Git 설정 및 자동 배포 설정을 시작합니다..."

# 1. Git 초기화 확인
if [ ! -d ".git" ]; then
    echo "📦 Git 저장소를 초기화합니다..."
    git init
    echo "✅ Git 저장소 초기화 완료"
else
    echo "✅ Git 저장소가 이미 존재합니다"
fi

# 2. .gitignore 확인
if [ ! -f ".gitignore" ]; then
    echo "❌ .gitignore 파일이 없습니다. 먼저 .gitignore 파일을 생성해주세요."
    exit 1
fi

# 3. 초기 커밋
echo "📝 초기 커밋을 생성합니다..."
git add .
git commit -m "Initial commit: Amond service with auto-deployment setup" || {
    echo "⚠️  변경사항이 없거나 이미 커밋되어 있습니다."
}

# 4. GitHub 저장소 정보 입력
echo ""
echo "🔧 GitHub 저장소 정보를 입력해주세요:"
read -p "GitHub 사용자명: " GITHUB_USERNAME
read -p "GitHub 저장소명: " GITHUB_REPO_NAME

# 5. 원격 저장소 설정
echo "🌐 원격 저장소를 설정합니다..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$GITHUB_USERNAME/$GITHUB_REPO_NAME.git"
git branch -M main

# 6. GitHub Secrets 설정 안내
echo ""
echo "🔐 GitHub Secrets 설정이 필요합니다:"
echo "GitHub 저장소 페이지에서 Settings > Secrets and variables > Actions로 이동하여 다음 시크릿을 추가해주세요:"
echo ""
echo "📋 백엔드 배포용 시크릿:"
echo "- EC2_HOST: EC2 인스턴스의 퍼블릭 IP 또는 도메인"
echo "- EC2_USER: EC2 사용자명 (보통 ec2-user)"
echo "- EC2_SSH_KEY: EC2 접속용 SSH 프라이빗 키 (전체 내용)"
echo "- EC2_FOLDER_NAME: EC2에 생성할 프로젝트 폴더명"
echo "- PM2_PROCESS_NAME: PM2 프로세스 이름"
echo ""
echo "📋 프론트엔드 배포용 시크릿:"
echo "- AWS_ACCESS_KEY_ID: AWS 액세스 키 ID"
echo "- AWS_SECRET_ACCESS_KEY: AWS 시크릿 액세스 키"
echo "- AWS_REGION: AWS 리전 (예: ap-northeast-2)"
echo "- S3_BUCKET_NAME: S3 버킷 이름"
echo "- CLOUDFRONT_DIST_ID: CloudFront 배포 ID"
echo ""

# 7. .env.deploy 파일 확인
if [ ! -f ".env.deploy" ]; then
    echo "⚠️  .env.deploy 파일이 없습니다. 기존 배포 스크립트를 사용하려면 이 파일을 생성해주세요."
    echo "예시:"
    echo "EC2_HOST=your-ec2-ip"
    echo "EC2_USER=ec2-user"
    echo "EC2_FOLDER_NAME=amond"
    echo "EC2_SSH_KEY=path/to/your/key.pem"
    echo "PM2_PROCESS_NAME=amond-backend"
    echo "S3_BUCKET_NAME=your-s3-bucket"
    echo "AWS_REGION=ap-northeast-2"
    echo "AWS_PROFILE=default"
    echo "CLOUDFRONT_DIST_ID=your-cloudfront-distribution-id"
fi

# 8. 코드 푸시
echo ""
read -p "GitHub에 코드를 푸시하시겠습니까? (y/N): " PUSH_CONFIRM
if [[ $PUSH_CONFIRM =~ ^[Yy]$ ]]; then
    echo "📤 GitHub에 코드를 푸시합니다..."
    git push -u origin main
    echo "✅ 코드 푸시 완료!"
    echo ""
    echo "🎉 설정이 완료되었습니다!"
    echo "이제 main 브랜치에 push할 때마다 자동으로 배포됩니다."
else
    echo "📝 나중에 다음 명령어로 푸시할 수 있습니다:"
    echo "git push -u origin main"
fi

echo ""
echo "📚 다음 단계:"
echo "1. GitHub Secrets 설정 완료"
echo "2. EC2 인스턴스에 Node.js, PM2 설치"
echo "3. 코드 수정 후 git push로 자동 배포 테스트"
echo ""
echo "🔗 유용한 링크:"
echo "- GitHub Actions: https://github.com/$GITHUB_USERNAME/$GITHUB_REPO_NAME/actions"
echo "- 저장소 설정: https://github.com/$GITHUB_USERNAME/$GITHUB_REPO_NAME/settings/secrets/actions" 