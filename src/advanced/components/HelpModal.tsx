import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">도움말</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* 할인 정책 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              할인 정책
            </h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start">
                <span className="font-medium w-32">개별 상품 할인:</span>
                <span>10개 이상 구매 시 상품별 할인율 적용</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">전체 수량 할인:</span>
                <span>30개 이상 구매 시 25% 할인</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">화요일 할인:</span>
                <span>매주 화요일 10% 추가 할인</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">⚡ 번개세일:</span>
                <span>무작위 시간에 시작, 30초마다 랜덤 상품 20% 할인</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">💝 추천할인:</span>
                <span>무작위 시간에 시작, 60초마다 추천 상품 5% 할인</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">🔥 SUPER SALE:</span>
                <span>번개세일 + 추천할인 동시 적용 시 25% 할인</span>
              </div>
            </div>
          </section>

          {/* 포인트 적립 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              포인트 적립
            </h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start">
                <span className="font-medium w-32">기본 적립:</span>
                <span>최종 결제 금액의 0.1% (1,000원당 1포인트)</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">화요일 보너스:</span>
                <span>화요일 구매 시 기본 포인트 2배</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">세트 구매 보너스:</span>
                <span>키보드+마우스 세트: +50p, 풀세트: +100p</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">수량 보너스:</span>
                <span>10개 이상: +20p, 20개 이상: +50p, 30개 이상: +100p</span>
              </div>
            </div>
          </section>

          {/* 재고 관리 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              재고 관리
            </h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start">
                <span className="font-medium w-32">재고 부족:</span>
                <span>5개 미만 시 "재고 부족" 표시</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">품절:</span>
                <span>0개 시 "품절" 표시 및 선택 불가</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">전체 재고:</span>
                <span>50개 미만 시 드롭다운 테두리 색상 변경</span>
              </div>
            </div>
          </section>

          {/* 사용법 */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-3">사용법</h3>
            <div className="space-y-3 text-gray-600">
              <div className="flex items-start">
                <span className="font-medium w-32">상품 선택:</span>
                <span>드롭다운에서 원하는 상품을 선택하세요</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">장바구니 추가:</span>
                <span>"장바구니에 추가" 버튼을 클릭하세요</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">수량 변경:</span>
                <span>+/- 버튼으로 수량을 조절하세요</span>
              </div>
              <div className="flex items-start">
                <span className="font-medium w-32">상품 제거:</span>
                <span>"삭제" 버튼으로 상품을 제거하세요</span>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
