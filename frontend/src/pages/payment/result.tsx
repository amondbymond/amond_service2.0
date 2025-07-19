import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Box, Typography, Button, Paper, Divider, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

export default function PaymentResult() {
  const router = useRouter();
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    if (router.isReady) {
      setPaymentData(router.query);
    }
  }, [router.isReady, router.query]);

  if (!paymentData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography>결제 결과를 불러오는 중...</Typography>
      </Box>
    );
  }

  const isSuccess = paymentData.resultCode === '0000';
  const membershipUpgraded = paymentData.membershipUpgraded === 'true';

  return (
    <Box sx={{ 
      bgcolor: isSuccess ? '#FFF3E0' : '#FFEBEE', 
      minHeight: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      p: 3
    }}>
      <Paper 
        elevation={8} 
        sx={{ 
          maxWidth: 600, 
          width: '100%', 
          p: 4, 
          borderRadius: 4,
          textAlign: 'center'
        }}
      >
        {isSuccess ? (
          <>
            <CheckCircleIcon 
              sx={{ 
                fontSize: 80, 
                color: '#4CAF50', 
                mb: 2 
              }} 
            />
            <Typography 
              fontSize={28} 
              fontWeight={700} 
              color="#4CAF50" 
              mb={2}
            >
              결제 성공!
            </Typography>
            <Typography 
              fontSize={18} 
              color="grey.700" 
              mb={3}
            >
              프로 요금제로 성공적으로 업그레이드되었습니다.
            </Typography>

            {membershipUpgraded && (
              <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography fontWeight={600} mb={1}>
                  🎉 멤버십 업그레이드 완료!
                </Typography>
                <Typography fontSize={14}>
                  • 월 콘텐츠 발행 횟수 (그리드): 1세트 → 4세트<br/>
                  • 콘텐츠별 수정 횟수: 2회 → 3회<br/>
                  • 기획도 생성: 1세트 → 4세트<br/>
                  • 자동 결제 등록 완료
                </Typography>
              </Alert>
            )}

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography fontWeight={600} fontSize={16} mb={2}>
                결제 정보
              </Typography>
              {paymentData.tid && (
                <Typography fontSize={14} mb={1}>
                  거래번호: {paymentData.tid}
                </Typography>
              )}
              {paymentData.orderNumber && (
                <Typography fontSize={14} mb={1}>
                  주문번호: {paymentData.orderNumber}
                </Typography>
              )}
              {paymentData.applDate && paymentData.applTime && (
                <Typography fontSize={14} mb={1}>
                  결제일시: {paymentData.applDate} {paymentData.applTime}
                </Typography>
              )}
              <Typography fontSize={14}>
                결제금액: ₩9,900 (월간)
              </Typography>
            </Box>

            <Button 
              variant="contained" 
              color="success"
              size="large"
              fullWidth
              sx={{ 
                fontWeight: 700, 
                fontSize: 16, 
                borderRadius: 2,
                mb: 2
              }}
              onClick={() => router.push('/subscribe')}
            >
              구독 관리 페이지로 이동
            </Button>
            <Button 
              variant="outlined" 
              color="success"
              size="large"
              fullWidth
              sx={{ 
                fontWeight: 500, 
                fontSize: 14, 
                borderRadius: 2
              }}
              onClick={() => router.push('/')}
            >
              홈으로 돌아가기
            </Button>
          </>
        ) : (
          <>
            <ErrorIcon 
              sx={{ 
                fontSize: 80, 
                color: '#F44336', 
                mb: 2 
              }} 
            />
            <Typography 
              fontSize={28} 
              fontWeight={700} 
              color="#F44336" 
              mb={2}
            >
              결제 실패
            </Typography>
            <Typography 
              fontSize={18} 
              color="grey.700" 
              mb={3}
            >
              결제 처리 중 문제가 발생했습니다.
            </Typography>

            <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
              <Typography fontWeight={600} mb={1}>
                오류 정보
              </Typography>
              <Typography fontSize={14}>
                오류 코드: {paymentData.resultCode || 'UNKNOWN'}<br/>
                오류 메시지: {decodeURIComponent(paymentData.resultMsg || '알 수 없는 오류가 발생했습니다.')}
              </Typography>
            </Alert>

            <Divider sx={{ my: 3 }} />

            <Typography fontSize={14} color="grey.600" mb={3}>
              결제에 문제가 있으시면 고객센터로 문의해주세요.<br/>
              다시 시도하시거나 다른 결제 수단을 이용해보세요.
            </Typography>

            <Button 
              variant="contained" 
              color="warning"
              size="large"
              fullWidth
              sx={{ 
                fontWeight: 700, 
                fontSize: 16, 
                borderRadius: 2,
                mb: 2
              }}
              onClick={() => router.push('/subscribe')}
            >
              다시 시도하기
            </Button>
            <Button 
              variant="outlined" 
              color="inherit"
              size="large"
              fullWidth
              sx={{ 
                fontWeight: 500, 
                fontSize: 14, 
                borderRadius: 2
              }}
              onClick={() => router.push('/')}
            >
              홈으로 돌아가기
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
}