import React from 'react';

const PolicySection: React.FC = () => {
  const discountPolicies = [
    {
      label: '개별 상품 할인:',
      description: '10개 이상 구매 시 상품별 할인율 적용',
    },
    {
      label: '전체 수량 할인:',
      description: '30개 이상 구매 시 25% 할인',
    },
    {
      label: '화요일 할인:',
      description: '매주 화요일 10% 추가 할인',
    },
    {
      label: '⚡ 번개세일:',
      description: '무작위 시간에 시작, 30초마다 랜덤 상품 20% 할인',
    },
    {
      label: '💝 추천할인:',
      description: '무작위 시간에 시작, 60초마다 추천 상품 5% 할인',
    },
    {
      label: '🔥 SUPER SALE:',
      description: '번개세일 + 추천할인 동시 적용 시 25% 할인',
    },
  ];

  const pointsPolicies = [
    {
      label: '기본 적립:',
      description: '최종 결제 금액의 0.1% (1,000원당 1포인트)',
    },
    {
      label: '화요일 보너스:',
      description: '화요일 구매 시 기본 포인트 2배',
    },
    {
      label: '세트 구매 보너스:',
      description: '키보드+마우스 세트: +50p, 풀세트: +100p',
    },
    {
      label: '수량 보너스:',
      description: '10개 이상: +20p, 20개 이상: +50p, 30개 이상: +100p',
    },
  ];

  const stockPolicies = [
    {
      label: '재고 부족:',
      description: '5개 미만 시 "재고 부족" 표시',
    },
    {
      label: '품절:',
      description: '0개 시 "품절" 표시 및 선택 불가',
    },
    {
      label: '전체 재고:',
      description: '50개 미만 시 드롭다운 테두리 색상 변경',
    },
  ];

  // 정책 섹션 렌더링
  const renderPolicySection = (
    title: string,
    policies: Array<{ label: string; description: string }>
  ) => {
    return (
      <section>
        <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="space-y-3 text-gray-600">
          {policies.map((policy) => (
            <div key={policy.label} className="flex items-start">
              <span className="font-medium w-32">{policy.label}</span>
              <span>{policy.description}</span>
            </div>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-6">
      {renderPolicySection('할인 정책', discountPolicies)}
      {renderPolicySection('포인트 적립', pointsPolicies)}
      {renderPolicySection('재고 관리', stockPolicies)}
    </div>
  );
};

export default PolicySection;
