-- ==========================================
-- 리뷰 데이터 수집 앱 오라클 DB 초기 데이터 (Seed Data)
-- Database Actions SQL 워크시트에서 복사하여 실행하세요.
-- ==========================================

-- 1. Users 데이터 삽입
INSERT INTO users (user_id, nickname, pref_spicy, pref_sweet, pref_value, pref_aesthetic, pref_depth) 
VALUES ('u1', '커피맛잘앎', 50, 70, 50, 80, 90);
INSERT INTO users (user_id, nickname, pref_spicy, pref_sweet, pref_value, pref_aesthetic, pref_depth) 
VALUES ('u2', '느긋한오후', 30, 80, 60, 70, 80);
INSERT INTO users (user_id, nickname, pref_spicy, pref_sweet, pref_value, pref_aesthetic, pref_depth) 
VALUES ('u3', '에스프레소덕후', 20, 40, 80, 60, 95);
INSERT INTO users (user_id, nickname, pref_spicy, pref_sweet, pref_value, pref_aesthetic, pref_depth) 
VALUES ('u4', '밥심으로살아', 70, 30, 90, 50, 80);
INSERT INTO users (user_id, nickname, pref_spicy, pref_sweet, pref_value, pref_aesthetic, pref_depth) 
VALUES ('u5', '미식가김씨', 60, 40, 70, 60, 90);
INSERT INTO users (user_id, nickname, pref_spicy, pref_sweet, pref_value, pref_aesthetic, pref_depth) 
VALUES ('u6', '생선러버', 80, 20, 70, 50, 85);
INSERT INTO users (user_id, nickname, pref_spicy, pref_sweet, pref_value, pref_aesthetic, pref_depth) 
VALUES ('u7', '출근전한잔', 40, 50, 90, 50, 80);
INSERT INTO users (user_id, nickname, pref_spicy, pref_sweet, pref_value, pref_aesthetic, pref_depth) 
VALUES ('u8', '파스타집착남', 50, 60, 50, 90, 70);
INSERT INTO users (user_id, nickname, pref_spicy, pref_sweet, pref_value, pref_aesthetic, pref_depth) 
VALUES ('u9', '청담미식러', 40, 50, 40, 85, 80);

-- 2. Stores 데이터 삽입
INSERT INTO stores (store_id, name, type, category, address, district, phone, hours, image_url, description, latitude, longitude, congestion) 
VALUES ('1', '포레스트 커피', 'cafe', '스페셜티 카페', '서울 마포구 연남동 223-14', '마포구', '02-1234-5678', '월–금 09:00–21:00, 토–일 10:00–22:00', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=500&fit=crop&auto=format', '에티오피아, 케냐 등 싱글오리진 원두를 직접 로스팅하는 스페셜티 카페입니다.', 37.5622, 126.9237, 40);
INSERT INTO stores (store_id, name, type, category, address, district, phone, hours, image_url, description, latitude, longitude, congestion) 
VALUES ('2', '온기 식당', 'restaurant', '한식', '서울 성동구 성수동1가 668-34', '성동구', '02-9876-5432', '화–일 11:30–21:00 (브레이크 15:00–17:30)', 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=500&fit=crop&auto=format', '제철 재료를 사용한 정갈한 한식. 매일 어머니가 직접 담근 김치가 나옵니다.', 37.5446, 127.0557, 75);
INSERT INTO stores (store_id, name, type, category, address, district, phone, hours, image_url, description, latitude, longitude, congestion) 
VALUES ('3', '블루밍 커피바', 'cafe', '에스프레소 바', '서울 용산구 이태원동 130-6', '용산구', '02-5555-1234', '매일 08:00–23:00', 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=500&fit=crop&auto=format', '이탈리안 에스프레소 스타일을 고집하는 작은 에스프레소 바.', 37.5345, 126.9946, 20);
INSERT INTO stores (store_id, name, type, category, address, district, phone, hours, image_url, description, latitude, longitude, congestion) 
VALUES ('4', '후추와 소금', 'restaurant', '이탈리안', '서울 강남구 청담동 79-11', '강남구', '02-7777-8888', '화–일 12:00–22:00 (브레이크 15:00–18:00)', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=500&fit=crop&auto=format', '신선한 국산 재료로 만드는 가정식 이탈리안. 생면 파스타를 직접 만듭니다.', 37.5252, 127.0473, 55);

-- 3. Store Tags 데이터 삽입
INSERT INTO store_tags (store_id, tag_name) VALUES ('1', '스페셜티');
INSERT INTO store_tags (store_id, tag_name) VALUES ('1', '싱글오리진');
INSERT INTO store_tags (store_id, tag_name) VALUES ('1', '핸드드립');
INSERT INTO store_tags (store_id, tag_name) VALUES ('1', '조용한');
INSERT INTO store_tags (store_id, tag_name) VALUES ('2', '한식');
INSERT INTO store_tags (store_id, tag_name) VALUES ('2', '제철재료');
INSERT INTO store_tags (store_id, tag_name) VALUES ('2', '가정식');
INSERT INTO store_tags (store_id, tag_name) VALUES ('2', '소박한');
INSERT INTO store_tags (store_id, tag_name) VALUES ('3', '에스프레소바');
INSERT INTO store_tags (store_id, tag_name) VALUES ('3', '이탈리안');
INSERT INTO store_tags (store_id, tag_name) VALUES ('3', '빠른');
INSERT INTO store_tags (store_id, tag_name) VALUES ('3', '직장인');
INSERT INTO store_tags (store_id, tag_name) VALUES ('4', '이탈리안');
INSERT INTO store_tags (store_id, tag_name) VALUES ('4', '생면파스타');
INSERT INTO store_tags (store_id, tag_name) VALUES ('4', '데이트');
INSERT INTO store_tags (store_id, tag_name) VALUES ('4', '분위기좋은');

-- 4. Menu Items 데이터 삽입
INSERT INTO menu_items (menu_id, store_id, name, category, price, description, image_url) 
VALUES ('m1', '1', '에티오피아 예가체프 핸드드립', '핸드드립', 8500, '자스민 플로럴, 복숭아, 밝은 산미의 워시드 예가체프', 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop&auto=format');
INSERT INTO menu_items (menu_id, store_id, name, category, price, description, image_url) 
VALUES ('m2', '1', '케냐 키아무티 에스프레소', '에스프레소', 5500, '블랙커런트, 토마토, 강한 바디의 케냐 AA 에스프레소', 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=600&h=400&fit=crop&auto=format');
INSERT INTO menu_items (menu_id, store_id, name, category, price, description, image_url) 
VALUES ('m3', '1', '콜드브루 토닉', '시그니처', 7000, '12시간 냉침 콜드브루에 토닉워터를 더한 시그니처 메뉴', 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600&h=400&fit=crop&auto=format');
INSERT INTO menu_items (menu_id, store_id, name, category, price, description, image_url) 
VALUES ('m4', '2', '된장찌개 정식', '정식', 12000, '국산 콩 된장으로 끓인 구수한 찌개와 제철 반찬 5가지', 'https://images.unsplash.com/photo-1583908701673-8b4b89f3b8b4?w=600&h=400&fit=crop&auto=format');
INSERT INTO menu_items (menu_id, store_id, name, category, price, description, image_url) 
VALUES ('m5', '2', '갈치조림', '생선', 15000, '제주산 은갈치에 무와 청양고추를 넣은 칼칼한 조림', 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=600&h=400&fit=crop&auto=format');
INSERT INTO menu_items (menu_id, store_id, name, category, price, description, image_url) 
VALUES ('m6', '3', '더블 에스프레소', '에스프레소', 4500, '브라질·콜롬비아 블렌딩의 균형 잡힌 더블 에스프레소', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&h=400&fit=crop&auto=format');
INSERT INTO menu_items (menu_id, store_id, name, category, price, description, image_url) 
VALUES ('m7', '4', '까르보나라 (생면)', '파스타', 18000, '판체타, 달걀 노른자, 페코리노 로마노로 만든 정통 까르보나라', 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=600&h=400&fit=crop&auto=format');
INSERT INTO menu_items (menu_id, store_id, name, category, price, description, image_url) 
VALUES ('m8', '4', '트러플 버섯 리소토', '리소토', 22000, '포르치니 버섯과 트러플 오일로 마무리한 고소한 리소토', 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?w=600&h=400&fit=crop&auto=format');

-- 5. Reviews 데이터 삽입
INSERT INTO reviews (review_id, user_id, menu_id, rating, dim1, dim2, dim3, dim4, dim5, comment_text, companion, purpose, helpful) 
VALUES ('r1', 'u1', 'm1', 5, 50, 70, 82, 96, 58, '바리스타가 직접 추출 방식을 설명해줄 만큼 전문적이에요.', 'solo', 'work', 12);
INSERT INTO reviews (review_id, user_id, menu_id, rating, dim1, dim2, dim3, dim4, dim5, comment_text, companion, purpose, helpful) 
VALUES ('r2', 'u2', 'm1', 4, 60, 74, 78, 94, 62, '가격이 좀 있지만 전문성은 확실해요. 인테리어도 아늑하고 오래 앉아있기 좋습니다.', 'friend', 'casual', 7);
INSERT INTO reviews (review_id, user_id, menu_id, rating, dim1, dim2, dim3, dim4, dim5, comment_text, companion, purpose, helpful) 
VALUES ('r3', 'u3', 'm2', 5, 32, 62, 76, 93, 74, '5,500원에 이 퀄리티면 가성비도 충분해요.', 'solo', 'casual', 9);
INSERT INTO reviews (review_id, user_id, menu_id, rating, dim1, dim2, dim3, dim4, dim5, comment_text, companion, purpose, helpful) 
VALUES ('r4', 'u4', 'm4', 5, 22, 68, 88, 92, 18, '집에서 먹는 된장찌개 맛 그대로입니다. 반찬 하나하나 정성이 느껴져요.', 'family', 'casual', 18);
INSERT INTO reviews (review_id, user_id, menu_id, rating, dim1, dim2, dim3, dim4, dim5, comment_text, companion, purpose, helpful) 
VALUES ('r5', 'u5', 'm4', 4, 28, 62, 82, 88, 22, '깊은 된장 풍미에 간이 적당해요. 기름지지 않아 먹고 나서도 개운합니다.', 'coworker', 'casual', 5);
INSERT INTO reviews (review_id, user_id, menu_id, rating, dim1, dim2, dim3, dim4, dim5, comment_text, companion, purpose, helpful) 
VALUES ('r6', 'u6', 'm5', 5, 70, 74, 80, 84, 28, '칼칼하지만 갈치살이 부드러워서 자꾸 손이 가요.', 'friend', 'hangover', 14);
INSERT INTO reviews (review_id, user_id, menu_id, rating, dim1, dim2, dim3, dim4, dim5, comment_text, companion, purpose, helpful) 
VALUES ('r7', 'u7', 'm6', 4, 38, 58, 52, 82, 92, '매일 출근 전에 들리는 곳. 4,500원에 이 퀄리티면 가성비 최고죠.', 'solo', 'work', 21);
INSERT INTO reviews (review_id, user_id, menu_id, rating, dim1, dim2, dim3, dim4, dim5, comment_text, companion, purpose, helpful) 
VALUES ('r8', 'u8', 'm7', 5, 75, 90, 52, 68, 92, '생면의 쫄깃함과 크리미한 소스가 환상적. 가격은 있지만 이 특별함은 돈 값 해요.', 'lover', 'date', 28);
INSERT INTO reviews (review_id, user_id, menu_id, rating, dim1, dim2, dim3, dim4, dim5, comment_text, companion, purpose, helpful) 
VALUES ('r9', 'u9', 'm7', 4, 69, 86, 58, 72, 88, '정통 스타일이라 생크림이 없어서 낯설 수 있지만 재료의 맛이 살아있어요.', 'lover', 'anniversary', 15);

-- 6. Review Tags 데이터 삽입
INSERT INTO review_tags (review_id, tag_name) VALUES ('r1', '핸드드립전문');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r1', '고급스러운');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r1', '전문바리스타');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r2', '아늑함');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r2', '전문바리스타');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r3', '가성비최고');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r3', '전문바리스타');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r4', '구수함');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r4', '정성가득');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r4', '집밥맛');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r5', '구수함');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r5', '깊은국물');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r6', '칼칼함');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r6', '얼큰함');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r6', '중독적');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r7', '가성비최고');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r7', '전문바리스타');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r8', '특별한경험');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r8', '플레이팅맛집');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r8', '크리미');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r9', '정통스타일');
INSERT INTO review_tags (review_id, tag_name) VALUES ('r9', '데이트코스');

COMMIT;
