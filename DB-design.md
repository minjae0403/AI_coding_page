# 📊 리뷰 데이터 수집 앱 데이터베이스 설계 제안

현재 구현되어 있는 웹사이트의 [mockData.ts](file:///C:/Users/user/Downloads/리뷰 데이터 수집 앱/src/app/components/mockData.ts) 구조 분석을 바탕으로, 데이터의 무결성과 확장성을 고려한 RDBMS(PostgreSQL/MySQL 기준)용 SQL DDL 문을 제안합니다.

---

## 1. 개치도 (ERD) 논리 구조 요약

- **User (사용자)** ──(1:N)──> **Review (리뷰)**
- **Store (매장)** ──(1:N)──> **MenuItem (메뉴)**
- **MenuItem (메뉴)** ──(1:N)──> **Review (리뷰)**
- **태그 관계** (User, Store, Review)는 정규화하여 다대다(M:N) 매핑 테이블로 처리합니다.

---

## 2. 테이블 정의 SQL (DDL)

```sql
-- 1. 사용자 프로필 및 취향 정보 테이블
CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,                    -- 사용자 ID (예: 이메일 또는 고유 식별자)
    nickname VARCHAR(50) NOT NULL UNIQUE,               -- 닉네임
    pref_spicy INT DEFAULT 50 CHECK (pref_spicy BETWEEN 0 AND 100),       -- 매운맛 선호도 (0-100)
    pref_sweet INT DEFAULT 50 CHECK (pref_sweet BETWEEN 0 AND 100),       -- 단맛 선호도 (0-100)
    pref_value INT DEFAULT 50 CHECK (pref_value BETWEEN 0 AND 100),       -- 가성비 선호도 (0-100)
    pref_aesthetic INT DEFAULT 50 CHECK (pref_aesthetic BETWEEN 0 AND 100), -- 분위기/비주얼 선호도 (0-100)
    pref_depth INT DEFAULT 50 CHECK (pref_depth BETWEEN 0 AND 100),       -- 전문성/깊은맛 선호도 (0-100)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. 사용자 관심 태그 테이블 (다대다 해소)
CREATE TABLE user_tags (
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE CASCADE,
    tag_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (user_id, tag_name)
);

-- 3. 매장 정보 테이블
CREATE TABLE stores (
    store_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('cafe', 'restaurant')),
    category VARCHAR(50) NOT NULL,                      -- 카테고리 (예: 스페셜티 카페, 한식 등)
    address VARCHAR(255) NOT NULL,
    district VARCHAR(50) NOT NULL,                      -- 행정구역 (예: 마포구, 성동구 등)
    phone VARCHAR(30),
    hours VARCHAR(255),
    image_url VARCHAR(255),
    description VARCHAR(255),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    congestion INT DEFAULT 0 CHECK (congestion BETWEEN 0 AND 100), -- 실시간 혼잡도 (0-100)
    congestion_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 매장 태그 테이블 (다대다 해소)
CREATE TABLE store_tags (
    store_id VARCHAR(50) REFERENCES stores(store_id) ON DELETE CASCADE,
    tag_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (store_id, tag_name)
);

-- 5. 메뉴 테이블
CREATE TABLE menu_items (
    menu_id VARCHAR(50) PRIMARY KEY,
    store_id VARCHAR(50) NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    price INT DEFAULT 0 CHECK (price >= 0),
    description VARCHAR(255),
    image_url VARCHAR(255)
);

-- 6. 리뷰 테이블
CREATE TABLE reviews (
    review_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL, 
    menu_id VARCHAR(50) NOT NULL REFERENCES menu_items(menu_id) ON DELETE CASCADE,
    rating NUMBER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    dim1 NUMBER DEFAULT 50,
    dim2 NUMBER DEFAULT 50,
    dim3 NUMBER DEFAULT 50,
    dim4 NUMBER DEFAULT 50,
    dim5 NUMBER DEFAULT 50,
    comment_text VARCHAR(255),
    companion VARCHAR(20) CHECK (companion IN ('solo', 'friend', 'lover', 'family', 'child', 'coworker')),
    purpose VARCHAR(20) CHECK (purpose IN ('value', 'anniversary', 'date', 'work', 'hangover', 'formal', 'casual')),
    helpful NUMBER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dim1 CHECK (dim1 IS NOT NULL AND dim1 BETWEEN 0 AND 100),
    CONSTRAINT chk_dim2 CHECK (dim2 IS NOT NULL AND dim2 BETWEEN 0 AND 100),
    CONSTRAINT chk_dim3 CHECK (dim3 IS NOT NULL AND dim3 BETWEEN 0 AND 100),
    CONSTRAINT chk_dim4 CHECK (dim4 IS NOT NULL AND dim4 BETWEEN 0 AND 100),
    CONSTRAINT chk_dim5 CHECK (dim5 IS NOT NULL AND dim5 BETWEEN 0 AND 100),
    CONSTRAINT chk_helpful CHECK (helpful IS NOT NULL AND helpful >= 0)
);

-- 7. 리뷰 태그 테이블 (다대다 해소)
CREATE TABLE review_tags (
    review_id VARCHAR(50) REFERENCES reviews(review_id) ON DELETE CASCADE,
    tag_name VARCHAR(30) NOT NULL,
    PRIMARY KEY (review_id, tag_name)
);
```

---

## 3. 핵심 쿼리 예시

### 3.1. 매장별 메뉴의 평균 Flavor Profile(맛 지표) 조회
웹 프론트엔드의 `avgFlavor`를 실시간 계산하여 동기화할 수 있는 쿼리입니다.
```sql
SELECT 
    m.menu_id,
    m.name AS menu_name,
    COALESCE(AVG(r.dim1), 50) AS avg_dim1,
    COALESCE(AVG(r.dim2), 50) AS avg_dim2,
    COALESCE(AVG(r.dim3), 50) AS avg_dim3,
    COALESCE(AVG(r.dim4), 50) AS avg_dim4,
    COALESCE(AVG(r.dim5), 50) AS avg_dim5
FROM menu_items m
LEFT JOIN reviews r ON m.menu_id = r.menu_id
GROUP BY m.menu_id, m.name;
```

---

> [!NOTE]
> - **맛의 5개 차원(dim1~dim5)**은 카테고리(`CuisineType`)에 따라 매칭 방식이 다릅니다. (예: `cafe_dessert`는 단맛, 비주얼, 감성, 커피전문성, 가성비로 치환)
> - **싱크율 계산**은 데이터베이스 쿼리나 서버 메모리 상에서 유클리드 거리(`SQRT(POW(...) + POW(...))`) 연산을 활용해 유저 취향 벡터와 매장의 평균 맛 벡터 간의 거리를 추출하여 연산할 수 있습니다.
