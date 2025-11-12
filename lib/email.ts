// ============================================
// Email Utility (Resend)
// ============================================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not set, skipping email send');
    return { success: false, message: 'Email service not configured' };
  }

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'FanPlace <noreply@fanplace.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error };
  }
}

// ============================================
// 이메일 템플릿
// ============================================

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail({
    to,
    subject: 'FanPlace에 오신 것을 환영합니다!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">FanPlace</h1>
          </div>
          <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>안녕하세요, ${name}님!</h2>
            <p>FanPlace 회원가입을 완료했습니다.</p>
            <p>이제 팬 이벤트를 등록하고, 장소를 예약하고, 광고를 집행할 수 있습니다.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL}" 
                 style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
                지금 시작하기
              </a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">
              © 2025 FanPlace. All rights reserved.
            </p>
          </div>
        </body>
      </html>
    `,
  });
}

export async function sendReceiptEmail(
  to: string,
  orderNumber: string,
  amount: number,
  productTitle: string
) {
  return sendEmail({
    to,
    subject: `[FanPlace] 결제 영수증 (${orderNumber})`,
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">결제가 완료되었습니다</h1>
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>주문번호:</strong> ${orderNumber}</p>
            <p><strong>상품:</strong> ${productTitle}</p>
            <p><strong>결제금액:</strong> ${amount.toLocaleString()}원</p>
          </div>
          <p>
            <a href="${process.env.NEXTAUTH_URL}/ko/account/orders" style="color: #667eea;">
              주문 내역 확인하기 →
            </a>
          </p>
        </body>
      </html>
    `,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/ko/auth/reset-password?token=${token}`;

  return sendEmail({
    to,
    subject: '[FanPlace] 비밀번호 재설정',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1>비밀번호 재설정</h1>
          <p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
          <div style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">
              비밀번호 재설정하기
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            이 링크는 1시간 동안 유효합니다.<br>
            요청하지 않았다면 이 메일을 무시하세요.
          </p>
        </body>
      </html>
    `,
  });
}

export async function sendEventApprovalEmail(to: string, eventTitle: string) {
  return sendEmail({
    to,
    subject: '[FanPlace] 이벤트가 승인되었습니다',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #10b981;">이벤트 승인 완료!</h1>
          <p>'{eventTitle}' 이벤트가 관리자 승인을 완료했습니다.</p>
          <p>이제 메인 페이지에 표시됩니다.</p>
          <a href="${process.env.NEXTAUTH_URL}/ko/account" style="color: #667eea;">
            내 계정에서 확인하기 →
          </a>
        </body>
      </html>
    `,
  });
}

