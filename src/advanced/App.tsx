import React from 'react';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-screen-xl mx-auto p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Advanced React + TypeScript
          </h1>
          <p className="text-lg text-gray-600">
            장바구니 시스템 - React + TypeScript 버전
          </p>
        </header>
        
        <main className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              🚀 React + TypeScript 환경 구축 완료!
            </h2>
            <p className="text-gray-600 mb-4">
              이제 컴포넌트 개발을 시작할 수 있습니다.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                ✅ TypeScript 설정 완료<br/>
                ✅ React 환경 구축 완료<br/>
                ✅ GitHub Pages 배포 준비 완료
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App; 