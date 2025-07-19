import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('INICIS Return Handler - Method:', req.method);
  console.log('INICIS Return Handler - Body:', req.body);
  console.log('INICIS Return Handler - Query:', req.query);

  if (req.method === 'POST') {
    // INICIS POST 응답 처리
    const {
      resultCode,
      resultMsg,
      mid,
      orderNumber,
      authToken,
      idc_name,
      authUrl,
      netCancelUrl,
      charset,
      merchantData
    } = req.body;

    console.log('INICIS POST Response:', {
      resultCode,
      resultMsg,
      orderNumber,
      authToken,
      authUrl
    });

    if (resultCode === '0000') {
      // 성공 시 빌링키 발급 요청을 위해 필요한 정보를 프론트엔드로 전달
      const successParams = new URLSearchParams({
        resultCode,
        resultMsg: resultMsg || '',
        orderNumber: orderNumber || '',
        authToken: authToken || '',
        authUrl: authUrl || '',
        idc_name: idc_name || ''
      });

      // 성공 페이지로 리다이렉트
      res.redirect(`/payment/billing-process?${successParams.toString()}`);
    } else {
      // 실패 시 에러 정보와 함께 실패 페이지로 리다이렉트
      const errorParams = new URLSearchParams({
        resultCode: resultCode || 'UNKNOWN',
        resultMsg: resultMsg || '결제 처리 중 오류가 발생했습니다.'
      });

      res.redirect(`/payment/result?${errorParams.toString()}`);
    }
  } else {
    // GET 요청 처리 (혹시 GET으로 오는 경우)
    console.log('GET request to return handler');
    const successParams = new URLSearchParams(req.query as Record<string, string>);
    res.redirect(`/payment/result?${successParams.toString()}`);
  }
}