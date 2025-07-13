# Brand Summary API Documentation

## Overview

The Brand Summary API provides intelligent analysis of brand information using OpenAI's GPT-4 model. It generates comprehensive brand analysis including positioning, target audience, content strategy, and visual recommendations.

## Endpoint

```
POST /content/brand-summary
```

## Authentication

This endpoint requires user authentication. Include your session token in the request.

## Request Body

### BrandInput Interface

```typescript
interface BrandInput {
  brandName: string; // 브랜드명
  category: string; // 카테고리
  reasons: string[]; // 운영 이유 배열
  description: string; // 브랜드 설명
  hasUrl: boolean | null; // URL 보유 여부
  url: string; // 브랜드 URL
  selectedImages: Array<{
    // 선택된 이미지 정보
    fileName: string;
    type: "manual" | "scraped";
    index: number;
  }>;
  imageCount: number; // 이미지 개수
}
```

### Example Request

```json
{
  "brandName": "아몬드 amond",
  "category": "뷰티/미용",
  "reasons": ["신제품 홍보", "팔로워 증진"],
  "description": "반려동물용 맞춤 사료 브랜드",
  "hasUrl": true,
  "url": "https://example.com",
  "selectedImages": [
    { "fileName": "image1.jpg", "type": "manual", "index": 0 },
    { "fileName": "image2.jpg", "type": "scraped", "index": 1 }
  ],
  "imageCount": 2
}
```

## Response

### Success Response (200)

```json
{
  "summary": "user-39님이 적어주신 이야기, 이렇게 요약해봤어요. ✨\n\n● 브랜드/상품명은 [아몬드 amond]...",
  "data": {
    "userName": "user-39",
    "brandName": "아몬드 amond",
    "category": "뷰티/미용",
    "reasons": ["신제품 홍보", "팔로워 증진"],
    "brandAnalysis": "혁신적인 브랜드",
    "advantages": "차별화된 서비스",
    "coreProduct": "아몬드 amond",
    "coreProductDescription": "고품질 서비스",
    "targetAudience": "타겟 고객",
    "targetDescription": "브랜드를 사랑하는 고객",
    "mainColor": "브랜드 컬러",
    "contentTypes": ["효능 강조", "사용 후기", "신제품 소개", "이벤트"],
    "conclusion": "아몬드 amond만의 독특한 매력을 어필하는 전략이 필요해요!"
  }
}
```

### Error Responses

#### 400 Bad Request

```json
{
  "error": "필수 필드가 누락되었습니다. 브랜드명, 카테고리, 운영이유, 설명을 모두 입력해주세요."
}
```

#### 404 Not Found

```json
{
  "error": "사용자 정보를 찾을 수 없습니다."
}
```

#### 500 Internal Server Error

```json
{
  "error": "브랜드 분석 중 오류가 발생했습니다.",
  "details": "OpenAI API 키가 설정되지 않았습니다."
}
```

## Supported Categories

The API supports the following categories with specialized content type recommendations:

1. **뷰티/미용** - 효능 강조, 사용 후기, 신제품 소개, 이벤트, 성분 스토리, 사용법 공유, 브랜드 무드, 뷰티 꿀팁, 챌린지, 인플루언서
2. **미식/푸드** - 메뉴 소개, 후기 리그램, 시즌 메뉴, 할인 이벤트, 공간 무드, 레시피 공유, 운영 안내, 고객 인증샷, 음식 철학, 비하인드
3. **일상/트렌드** - 일상 공유, 감성 무드, 트렌드 밈, 팔로워 소통, Q&A, 챌린지, 루틴 공개, 투표 유도, 공감 한줄, 소소한 팁
4. **패션** - 착장 소개, 신상 오픈, 스타일링팁, 할인 공지, 후기 공유, 룩북 공개, 브랜드 무드, 소재 강조, 착용샷, 촬영 비하인드
5. **자기개발** - 인사이트, 동기부여, 후기 인증, 강의 소개, 꿀팁 요약, 브랜딩 강조, 체크리스트, 컨설팅 홍보, 일상 회고, 성장 스토리
6. **지식 콘텐츠** - 트렌드 요약, 뉴스 큐레이션, 카드뉴스, 인포그래픽, 데이터 요약, 개념 정리, 퀴즈, 세미나 홍보, 용어 해설, 브리핑
7. **건강/헬스** - 운동 루틴, 후기 사례, 클래스 안내, 식단 공유, 헬스 꿀팁, 자기관리, 감성 인용, 무료 체험, 공간 소개, 전문가 소개
8. **기타** - 서비스/상품 소개, 창업 스토리, 기능 강조, 팔로우 이벤트, 후기 공유, 가치 전달, 협업 공개, Q&A, 무드컷, 제품 안내

## Features

### AI-Powered Analysis

- **Brand Positioning**: Analyzes brand positioning and market stance
- **Target Audience**: Identifies and describes target customer segments
- **Content Strategy**: Recommends 4 optimal content types for the category
- **Visual Recommendations**: Suggests main colors for brand identity
- **Advantage Analysis**: Highlights key brand advantages and differentiators

### Response Formats

The API provides two response formats:

1. **Formatted Text (`summary`)**: Ready-to-use formatted text for display
2. **Structured Data (`data`)**: Raw data for custom UI implementation

### Error Handling

- Comprehensive validation of required fields
- Graceful fallback responses if AI analysis fails
- Detailed error messages for debugging

## Implementation Notes

### Environment Variables

Make sure the following environment variable is set:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Database Requirements

The endpoint requires a `user` table with the following structure:

```sql
CREATE TABLE user (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  -- other fields...
);
```

### Rate Limiting

The endpoint is protected by the existing rate limiting middleware configured in the Express app.

## Usage Examples

### Frontend Integration

```javascript
// Example frontend call
const response = await fetch("/content/brand-summary", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  credentials: "include", // Include session cookies
  body: JSON.stringify(brandInput),
});

const result = await response.json();
console.log("Summary:", result.summary);
console.log("Data:", result.data);
```

### Node.js Module Usage

```javascript
const { generateBrandChatter } = require("./module/brandAnalysis");

const result = await generateBrandChatter(brandInput, userName, openaiApiKey);
console.log(result.formattedText);
console.log(result.data);
```
