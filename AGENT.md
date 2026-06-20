# 프로젝트 가이드라인 (AGENT.md)

이 문서는 이 저장소에서 기능을 수정하고 GitHub Pages까지 반영하는 기본 절차를 정리합니다.

## 기술 스택
- 프론트엔드: React, Vite
- 언어: TypeScript
- 스타일: Tailwind CSS
- UI 컴포넌트: shadcn/ui

## 작업 원칙
1. 컴포넌트는 가능한 한 `src/app/components` 아래에 분리합니다.
2. 상태 관리는 상위 컴포넌트(`src/app/App.tsx`)에서 제어하고, 하위 컴포넌트는 props로 받습니다.
3. 범위 계산이나 수치 보정은 `Math.min` / `Math.max`로 안전하게 처리합니다.
4. 기능 추가 후에는 `README.md` 또는 이 파일의 절차를 함께 갱신합니다.

## 로컬 수정 후 GitHub Pages 반영 방법
GitHub Pages가 `gh-pages` 브랜치를 배포 소스로 사용하므로, `master`에만 푸시하면 배포가 반영되지 않습니다.

### 기본 절차
1. 로컬에서 기능 수정 후 저장합니다.
2. 빌드를 실행합니다.
   ```bash
   npm run build
   ```
3. 빌드 결과가 `dist/`에 생성되는지 확인합니다.
4. `dist/` 내용을 `gh-pages` 브랜치에 강제로 배포합니다.
   ```bash
   $split = (git subtree split --prefix dist master | Select-Object -Last 1).Trim(); git push origin "$split`:gh-pages" --force
   ```
5. GitHub 저장소의 `Settings > Pages`에서 배포 소스가 `gh-pages`인지 확인합니다.
6. 배포 후 GitHub Pages URL에서 반영 여부를 확인합니다.

### 주의 사항
- `git subtree push --prefix dist origin gh-pages`가 거절되면, 원격 `gh-pages`에 기존 히스토리가 있는 상태입니다. 이 경우 배포용 브랜치이므로 `--force`로 덮어쓰는 방식이 일반적입니다.
- `dist/`는 빌드 산출물이므로 소스 수정만 했을 때 자동 반영되지 않습니다. 반드시 `npm run build` 이후 배포해야 합니다.
- `base` 경로는 GitHub Pages 경로와 맞아야 합니다. 현재 프로젝트는 `/AI_coding_page/`를 사용합니다.

## 개발 명령
- 개발 서버 실행: `npm run dev`
- 프로덕션 빌드: `npm run build`
