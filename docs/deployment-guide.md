# 배포 환경별 Vite 설정 가이드

## 📋 개요

이 프로젝트는 다양한 배포 환경에 맞춰 Vite 설정을 동적으로 변경할 수 있도록 구성되어 있습니다.

## 🚀 사용 가능한 배포 환경

### 1. Development (개발용)
- **설정 파일**: `vite.config.advanced.development.js`
- **Base 경로**: `''` (상대 경로)
- **용도**: 로컬 개발 및 테스트
- **명령어**: `pnpm deploy:dev`

### 2. GitHub Pages
- **설정 파일**: `vite.config.advanced.github-pages.js`
- **Base 경로**: `/front_6th_chapter2-1/` (레포지토리명 기반)
- **용도**: GitHub Pages 배포
- **명령어**: `pnpm deploy:gh-pages`

### 3. Production (프로덕션)
- **설정 파일**: `vite.config.advanced.production.js`
- **Base 경로**: `'./'` (루트 도메인용 상대 경로)
- **용도**: 일반 웹 서버 배포
- **명령어**: `pnpm deploy:prod`

## 🛠️ 사용법

### 기본 명령어

```bash
# 개발용 배포
pnpm deploy:dev

# GitHub Pages 배포
pnpm deploy:gh-pages

# 프로덕션 배포
pnpm deploy:prod
```

### 직접 스크립트 실행

```bash
# 스크립트 직접 실행
./scripts/deploy.sh dev
./scripts/deploy.sh gh-pages
./scripts/deploy.sh prod

# 또는 환경명 생략 (기본값: dev)
./scripts/deploy.sh
```

### 개별 빌드 명령어

```bash
# 개발용 빌드
pnpm build:advanced:dev

# GitHub Pages용 빌드
pnpm build:advanced:gh-pages

# 프로덕션용 빌드
pnpm build:advanced:prod
```

## 📁 파일 구조

```
├── vite.config.advanced.js              # 기본 설정
├── vite.config.advanced.development.js  # 개발용 설정
├── vite.config.advanced.github-pages.js # GitHub Pages 설정
├── vite.config.advanced.production.js   # 프로덕션 설정
├── scripts/
│   └── deploy.sh                        # 배포 스크립트
└── dist/
    └── advanced/                        # 빌드 결과물
```

## 🔧 설정 파일 상세

### Development 설정
```javascript
export default defineConfig({
  build: {
    base: '', // 상대 경로
  },
});
```

### GitHub Pages 설정
```javascript
export default defineConfig({
  build: {
    base: '/front_6th_chapter2-1/', // 레포지토리명 기반
  },
});
```

### Production 설정
```javascript
export default defineConfig({
  build: {
    base: './', // 루트 도메인용 상대 경로
  },
});
```

## 🚀 배포 프로세스

### 1. Development 배포
```bash
pnpm deploy:dev
# 결과: dist/advanced/ (로컬 테스트용)
```

### 2. GitHub Pages 배포
```bash
pnpm deploy:gh-pages
# 결과: dist/advanced/ (GitHub Pages 업로드용)
```

### 3. Production 배포
```bash
pnpm deploy:prod
# 결과: dist/advanced/ (웹 서버 업로드용)
```

## 🔍 문제 해결

### 빌드 실패 시
1. **캐시 정리**: `pnpm clean:advanced`
2. **의존성 재설치**: `pnpm install`
3. **Node.js 버전 확인**: `node --version`

### 경로 문제 시
1. **설정 파일 확인**: 해당 환경의 `vite.config.advanced.*.js` 파일 확인
2. **Base 경로 확인**: `base` 설정이 올바른지 확인
3. **배포 환경 확인**: 올바른 환경으로 빌드했는지 확인

## 📝 주의사항

1. **GitHub Pages**: 레포지토리명이 변경되면 `vite.config.advanced.github-pages.js`의 `base` 경로도 수정 필요
2. **프로덕션**: 웹 서버의 루트 디렉토리에 배포할 때는 `production` 설정 사용
3. **개발**: 로컬 테스트 시에는 `development` 설정 사용

## 🎯 권장 워크플로우

1. **개발 단계**: `pnpm deploy:dev` → 로컬 테스트
2. **GitHub Pages 배포**: `pnpm deploy:gh-pages` → GitHub Pages 업로드
3. **프로덕션 배포**: `pnpm deploy:prod` → 웹 서버 업로드 