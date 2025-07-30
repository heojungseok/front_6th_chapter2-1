#!/bin/bash

# 배포 환경별 Vite 설정 스크립트
# 사용법: ./scripts/deploy.sh [environment]
# 환경: dev, gh-pages, prod (기본값: dev)

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

# 환경 설정
ENVIRONMENT=${1:-dev}

case $ENVIRONMENT in
    "dev"|"development")
        CONFIG_FILE="vite.config.advanced.development.js"
        BUILD_SCRIPT="build:advanced:dev"
        ENV_NAME="Development"
        ;;
    "gh-pages"|"github")
        CONFIG_FILE="vite.config.advanced.github-pages.js"
        BUILD_SCRIPT="build:advanced:gh-pages"
        ENV_NAME="GitHub Pages"
        ;;
    "prod"|"production")
        CONFIG_FILE="vite.config.advanced.production.js"
        BUILD_SCRIPT="build:advanced:prod"
        ENV_NAME="Production"
        ;;
    *)
        log_error "Unknown environment: $ENVIRONMENT"
        echo "Usage: $0 [dev|gh-pages|prod]"
        echo "  dev      - Development environment (relative paths)"
        echo "  gh-pages - GitHub Pages environment (repository-based paths)"
        echo "  prod     - Production environment (root domain paths)"
        exit 1
        ;;
esac

# 배포 시작
log_info "Starting deployment for $ENV_NAME environment..."

# 1. 기존 빌드 파일 정리
log_info "Cleaning previous build files..."
pnpm clean:advanced

# 2. 설정 파일 존재 확인
if [ ! -f "$CONFIG_FILE" ]; then
    log_error "Configuration file not found: $CONFIG_FILE"
    exit 1
fi

# 3. 빌드 실행
log_info "Building with configuration: $CONFIG_FILE"
pnpm $BUILD_SCRIPT

# 4. 빌드 결과 확인
if [ -d "dist/advanced" ] && [ -f "dist/advanced/index.html" ]; then
    log_success "Build completed successfully!"
    
    # 5. 빌드 정보 출력
    log_info "Build details:"
    echo "  - Output directory: dist/advanced/"
    echo "  - Configuration: $CONFIG_FILE"
    echo "  - Environment: $ENV_NAME"
    
    # 6. 파일 크기 정보
    if command -v du &> /dev/null; then
        TOTAL_SIZE=$(du -sh dist/advanced | cut -f1)
        log_info "Total build size: $TOTAL_SIZE"
    fi
    
    # 7. 환경별 추가 정보
    case $ENVIRONMENT in
        "dev"|"development")
            log_info "For local testing, run: cd dist/advanced && python3 -m http.server 8080"
            ;;
        "gh-pages"|"github")
            log_info "For GitHub Pages deployment, push the dist/advanced/ directory to gh-pages branch"
            ;;
        "prod"|"production")
            log_info "For production deployment, upload the dist/advanced/ directory to your web server"
            ;;
    esac
    
else
    log_error "Build failed! Check the build output above."
    exit 1
fi

log_success "Deployment script completed successfully!" 