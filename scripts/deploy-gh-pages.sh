#!/bin/bash

# GitHub Pages 배포 스크립트
# dist/advanced/ 폴더의 내용을 GitHub Pages에 배포

set -e

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 로그 함수
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 배포 시작
log_info "Starting GitHub Pages deployment..."

# 1. Advanced 버전 빌드
log_info "Building advanced version for GitHub Pages..."
pnpm deploy:gh-pages

# 2. dist/advanced/ 폴더 확인
if [ ! -d "dist/advanced" ]; then
    log_error "dist/advanced/ directory not found!"
    exit 1
fi

# 3. GitHub Pages 배포 폴더 생성
log_info "Creating GitHub Pages deployment folder..."
rm -rf dist/gh-pages
mkdir -p dist/gh-pages

# 4. dist/advanced/ 내용을 dist/gh-pages/로 복사
log_info "Copying build files to GitHub Pages folder..."
cp -r dist/advanced/* dist/gh-pages/

# 5. 배포 정보 출력
log_success "GitHub Pages deployment files ready!"
log_info "Deployment folder: dist/gh-pages/"
log_info "Files to deploy:"
ls -la dist/gh-pages/

# 6. 배포 가이드
log_info "Next steps:"
echo "1. Push the contents of dist/gh-pages/ to your gh-pages branch"
echo "2. Or use GitHub Actions for automatic deployment"
echo "3. Your site will be available at: https://heojungseok.github.io/front_6th_chapter2-1/"

log_success "GitHub Pages deployment preparation completed!" 