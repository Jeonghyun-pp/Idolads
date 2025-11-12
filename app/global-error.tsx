"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ko">
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          backgroundColor: '#000',
          color: '#fff',
        }}>
          <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>
            심각한 오류가 발생했습니다
          </h2>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              backgroundColor: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}

