// ============================================
// 토스페이먼츠 결제 라이브러리
// ============================================

export interface PaymentRequest {
  amount: number;
  orderId: string;
  orderName: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentConfirmRequest {
  paymentKey: string;
  orderId: string;
  amount: number;
}

/**
 * 결제 승인
 */
export async function confirmPayment(data: PaymentConfirmRequest) {
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || '결제 승인 실패');
  }

  return result;
}

/**
 * 결제 취소
 */
export async function cancelPayment(paymentKey: string, cancelReason: string) {
  const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ cancelReason }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || '결제 취소 실패');
  }

  return result;
}

/**
 * 결제 조회
 */
export async function getPayment(paymentKey: string) {
  const response = await fetch(`https://api.tosspayments.com/v1/payments/${paymentKey}`, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from(process.env.TOSS_SECRET_KEY + ':').toString('base64'),
    },
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || '결제 조회 실패');
  }

  return result;
}

