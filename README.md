# Amond Service

이 저장소는 Amond 서비스의 백엔드 API 서버와 Next.js 프론트엔드를 함께 포함하고 있습니다.

## 🚀 자동 배포 설정

이 프로젝트는 GitHub Actions를 통해 자동 배포가 설정되어 있습니다.

### 배포 트리거

- `main` 또는 `master` 브랜치에 push할 때 자동 배포
- GitHub Actions 페이지에서 수동 배포 가능

### 배포 프로세스

1. **백엔드 배포**: EC2 인스턴스에 자동 배포
2. **프론트엔드 배포**: S3 버킷에 빌드 후 업로드, CloudFront 캐시 무효화

## 🔧 초기 설정

### 1. Git 저장소 설정

```bash
# Git 초기화
git init
git add .
git commit -m "Initial commit"

# GitHub 저장소 생성 후 원격 저장소 추가
git remote add origin https://github.com/yourusername/amond_new.git
git branch -M main
git push -u origin main
```

### 2. GitHub Secrets 설정

GitHub 저장소의 Settings > Secrets and variables > Actions에서 다음 시크릿을 추가:

#### 백엔드 배포용

- `EC2_HOST`: EC2 인스턴스의 퍼블릭 IP 또는 도메인
- `EC2_USER`: EC2 사용자명 (보통 `ec2-user`)
- `EC2_SSH_KEY`: EC2 접속용 SSH 프라이빗 키 (전체 내용)
- `EC2_FOLDER_NAME`: EC2에 생성할 프로젝트 폴더명
- `PM2_PROCESS_NAME`: PM2 프로세스 이름

#### 프론트엔드 배포용

- `AWS_ACCESS_KEY_ID`: AWS 액세스 키 ID
- `AWS_SECRET_ACCESS_KEY`: AWS 시크릿 액세스 키
- `AWS_REGION`: AWS 리전 (예: `ap-northeast-2`)
- `S3_BUCKET_NAME`: S3 버킷 이름
- `CLOUDFRONT_DIST_ID`: CloudFront 배포 ID

### 3. EC2 설정

EC2 인스턴스에 다음이 설치되어 있어야 합니다:

- Node.js 18+
- PM2 (`npm install -g pm2`)
- Git

## 📦 수동 배포

### 백엔드만 배포

```bash
./deploy_backend.sh
```

### 프론트엔드만 배포

```bash
./deploy_frontend.sh
```

### 전체 배포

```bash
./start_all.sh
```

## 🔄 자동 배포 워크플로우

### 배포 시나리오

1. **코드 변경**: 로컬에서 코드 수정
2. **Git Push**: `main` 브랜치에 push
3. **자동 배포**: GitHub Actions가 자동으로 실행
4. **배포 완료**: EC2와 S3에 자동 업데이트

### 배포 확인

- GitHub Actions 탭에서 배포 상태 확인
- EC2: `pm2 status`로 프로세스 상태 확인
- S3: 버킷 내용 확인
- CloudFront: 캐시 무효화 확인

## 🛠️ 개발 환경

### 백엔드 (Node.js + Express)

```bash
cd backend
npm install
npm run dev
```

### 프론트엔드 (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## 📁 프로젝트 구조

```
Amond_new/
├── backend/          # Express.js 백엔드
├── frontend/         # Next.js 프론트엔드
├── .github/          # GitHub Actions 워크플로우
├── deploy_backend.sh # 백엔드 수동 배포 스크립트
├── deploy_frontend.sh # 프론트엔드 수동 배포 스크립트
└── start_all.sh      # 전체 배포 스크립트
```

## 🔒 보안 주의사항

- `.env.deploy` 파일은 Git에 포함되지 않습니다
- SSH 키와 AWS 자격 증명은 GitHub Secrets에 안전하게 저장됩니다
- 프로덕션 환경 변수는 별도로 관리됩니다
