import { Box, Button, Typography, Paper, Divider, Modal, TextField, Checkbox, FormControlLabel } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";
import { apiCall } from "@/module/utils/api";
import InicisPayment from "@/component/pageComponent/subscribe/InicisPayment";

type MuiButtonColor = 'primary' | 'secondary' | 'inherit' | 'success' | 'error' | 'info' | 'warning';

const plans = [
  {
    name: "베이직",
    description: "처음 아몬드를 접하고 경험하는 분들에게 추천해요",
    price: "무료",
    highlight: "무료 체험",
    highlights: [
      { label: "월 콘텐츠 발행 횟수 (그리드)", value: "1세트" },
      { label: "콘텐츠별 수정 횟수", value: "2회" },
      { label: "기획도 생성", value: "1세트" },
      { label: "전담 매니저 SNS 컨설팅", value: "X" },
    ],
    button: { label: "무료체험", color: "default", type: "black", disabled: false },
  },
  {
    name: "프로",
    description: "처음 아몬드를 접하고 경험하는 분들에게 추천해요",
    price: "9,900원/월",
    highlight: "7일간 무료체험",
    highlights: [
      { label: "월 콘텐츠 발행 횟수 (그리드)", value: "4세트" },
      { label: "콘텐츠별 수정 횟수", value: "3회" },
      { label: "기획도 생성", value: "4세트" },
      { label: "전담 매니저 SNS 컨설팅", value: "X" },
    ],
    button: { label: "7일간 무료체험", color: "warning", type: "orange", disabled: false },
    recommend: true,
  },
  {
    name: "비즈니스",
    description: "처음 아몬드를 접하고 경험하는 분들에게 추천해요",
    price: "29,000원/월",
    highlight: "To Be Continued!",
    highlights: [
      { label: "월 콘텐츠 발행 횟수 (그리드)", value: "10세트" },
      { label: "콘텐츠별 수정 횟수", value: "10회" },
      { label: "기획도 생성", value: "10세트" },
      { label: "전담 매니저 SNS 컨설팅", value: "O" },
    ],
    button: { label: "To Be Continued!", color: "inherit", type: "grey", disabled: true },
  },
  {
    name: "프리미엄",
    description: "처음 아몬드를 접하고 경험하는 분들에게 추천해요",
    price: "79,000원/월",
    highlight: "To Be Continued!",
    highlights: [
      { label: "월 콘텐츠 발행 횟수 (그리드)", value: "무제한" },
      { label: "콘텐츠별 수정 횟수", value: "무제한" },
      { label: "기획도 생성", value: "무제한" },
      { label: "전담 매니저 SNS 컨설팅", value: "O" },
    ],
    button: { label: "To Be Continued!", color: "inherit", type: "grey", disabled: true },
  },
];

function PlanButton({ plan, onOrangeClick }: { plan: typeof plans[number]; onOrangeClick?: () => void }) {
  const router = useRouter();
  const handleFreeTrial = async () => {
    try {
      const response = await apiCall({
        url: "/content/project",
        method: "get",
      });
      if (response.data.projectId) {
        router.push(`/project/${response.data.projectId}`);
      } else {
        alert("프로젝트가 없습니다.");
      }
    } catch (e) {
      alert("프로젝트 이동 실패");
    }
  };
  if (plan.button.type === "orange") {
    return (
      <Button
        fullWidth
        variant="contained"
        color="warning"
        sx={{ fontWeight: 700, fontSize: 16, mb: 2, borderRadius: 2 }}
        disabled={plan.button.disabled}
        onClick={onOrangeClick}
      >
        {plan.button.label}
      </Button>
    );
  }
  if (plan.button.type === "black") {
    return (
      <Button
        fullWidth
        variant="contained"
        sx={{ bgcolor: "#222", color: "#fff", fontWeight: 700, fontSize: 16, mb: 2, borderRadius: 2, '&:hover': { bgcolor: '#111' } }}
        disabled={plan.button.disabled}
        onClick={handleFreeTrial}
      >
        {plan.button.label}
      </Button>
    );
  }
  return (
    <Button
      fullWidth
      variant="contained"
      sx={{ bgcolor: "#eee", color: "#888", fontWeight: 700, fontSize: 16, mb: 2, borderRadius: 2 }}
      disabled
    >
      {plan.button.label}
    </Button>
  );
}

function ProTrialModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank'>('card');
  const [billingOption, setBillingOption] = useState<'monthly'>('monthly');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [inicisModalOpen, setInicisModalOpen] = useState(false);

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          bgcolor: "background.paper",
          borderRadius: 4,
          boxShadow: 24,
          p: 4,
          outline: "none",
        }}
      >
        <Box sx={{ mb: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <img src="/assets/arrow-up.png" alt="업그레이드 화살표" style={{ width: 40, height: 'auto' }} />
        </Box>
        <Typography fontWeight={700} fontSize={28} mb={1}>
          프로 요금제로 업그레이드
        </Typography>
        <Typography color="grey.600" fontSize={16} mb={3}>
          더 많은 콘텐츠를 편하게 제작하고, AI로 마케팅을 자동화 하세요.
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField 
            label="이름" 
            size="small" 
            sx={{ flex: 1 }} 
            value={name} 
            onChange={e => setName(e.target.value)}
          />
          <TextField 
            label="회사 이름(선택)" 
            size="small" 
            sx={{ flex: 1 }} 
            value={company} 
            onChange={e => setCompany(e.target.value)}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField 
            label="이메일" 
            type="email"
            size="small" 
            sx={{ flex: 1 }} 
            value={email} 
            onChange={e => setEmail(e.target.value)}
          />
          <TextField 
            label="휴대폰 번호" 
            size="small" 
            sx={{ flex: 1 }} 
            value={phone} 
            placeholder="010-1234-5678"
            onChange={e => setPhone(e.target.value)}
          />
        </Box>
        <Typography fontWeight={700} mb={1}>
          결제 수단
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button 
            variant={paymentMethod === 'card' ? "contained" : "outlined"} 
            sx={{ 
              flex: 1, 
              fontWeight: 700, 
              borderRadius: 2,
              minHeight: 48,
              ...(paymentMethod === 'card' && {
                bgcolor: '#FFA726',
                color: '#fff',
                '&:hover': { bgcolor: '#FF9800' }
              }),
              ...(paymentMethod !== 'card' && {
                borderColor: '#ddd',
                color: '#666',
                '&:hover': { 
                  borderColor: '#FFA726', 
                  color: '#FFA726',
                  borderWidth: '2px',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(255, 167, 38, 0.2)'
                }
              })
            }}
            onClick={() => setPaymentMethod('card')}
          >
            신용 카드
          </Button>
          <Button 
            variant={paymentMethod === 'bank' ? "contained" : "outlined"} 
            sx={{ 
              flex: 1, 
              fontWeight: 700, 
              borderRadius: 2,
              minHeight: 48,
              ...(paymentMethod === 'bank' && {
                bgcolor: '#FFA726',
                color: '#fff',
                '&:hover': { bgcolor: '#FF9800' }
              }),
              ...(paymentMethod !== 'bank' && {
                borderColor: '#ddd',
                color: '#666',
                '&:hover': { 
                  borderColor: '#FFA726', 
                  color: '#FFA726',
                  borderWidth: '2px',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 8px rgba(255, 167, 38, 0.2)'
                }
              })
            }}
            onClick={() => setPaymentMethod('bank')}
          >
            무통장 입금
          </Button>
        </Box>
        
        {paymentMethod === 'bank' ? (
          <>
            <Typography fontWeight={700} mb={1}>
              청구 정보
            </Typography>
            <Box sx={{ 
              border: "2px solid #FFA726", 
              borderRadius: 2, 
              p: 2, 
              mb: 3,
              bgcolor: '#FFF3E0'
            }}>
              <Typography fontWeight={600} fontSize={15} mb={1}>
                입금 계좌 정보
              </Typography>
              <Typography fontSize={14} color="grey.700" mb={0.5}>
                은행: 신한은행
              </Typography>
              <Typography fontSize={14} color="grey.700" mb={0.5}>
                계좌번호: 110-123-456789
              </Typography>
              <Typography fontSize={14} color="grey.700" mb={0.5}>
                예금주: 아몬드주식회사
              </Typography>
              <Typography fontSize={14} color="grey.700" fontWeight={600}>
                입금금액: ₩ 9,900원
              </Typography>
            </Box>
          </>
        ) : (
          <>
            <Typography fontWeight={700} mb={1}>
              청구 옵션
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox 
                    checked={billingOption === 'monthly'}
                    onChange={() => setBillingOption('monthly')}
                    sx={{
                      color: '#FFA726',
                      '&.Mui-checked': {
                        color: '#FFA726',
                      },
                    }}
                  />
                }
                label={
                  <Typography fontWeight={500} fontSize={15}>
                    월간 결제 <b>₩ 9,900원 / 월</b>
                  </Typography>
                }
                sx={{
                  border: "2px solid #FFA726",
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  m: 0,
                  bgcolor: '#FFF3E0'
                }}
              />
            </Box>
          </>
        )}
        
        <FormControlLabel control={<Checkbox />} label="전체 동의" sx={{ mb: 1 }} />
        <Box sx={{ pl: 3, mb: 3 }}>
          <FormControlLabel control={<Checkbox />} label="구매조건 확인 및 결제진행에 동의" />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
          <Box>
            <Typography fontWeight={700} fontSize={22}>
              ₩ 9,900원 / 월
            </Typography>
          </Box>
          <Box>
            <Button 
              variant="contained" 
              color="warning" 
              sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2 }}
              onClick={() => {
                if (paymentMethod === 'card') {
                  if (!name || !email || !phone) {
                    alert('이름, 이메일, 휴대폰 번호를 모두 입력해주세요.');
                    return;
                  }
                  setInicisModalOpen(true);
                }
              }}
            >
              {paymentMethod === 'bank' ? '무통장 입금 신청' : '프로 요금제로 업그레이드'}
            </Button>
            <Button variant="outlined" sx={{ ml: 2, color: '#888', borderColor: '#eee', fontWeight: 500, fontSize: 14, mt: 1 }} disabled>
              문의 사항이 있으신가요?
            </Button>
          </Box>
        </Box>
        
        <InicisPayment
          open={inicisModalOpen}
          onClose={() => setInicisModalOpen(false)}
          planName="프로"
          planPrice={9900}
          buyerName={name}
          buyerEmail={email}
          buyerTel={phone}
        />
      </Box>
    </Modal>
  );
}

export default function SubscribePage() {
  const [proModalOpen, setProModalOpen] = useState(false);
  return (
    <Box sx={{ bgcolor: "#FFF3E0", minHeight: "100vh", pb: 6 }}>
      <ProTrialModal open={proModalOpen} onClose={() => setProModalOpen(false)} />
      <Box sx={{ maxWidth: 1400, mx: "auto", pt: 8, px: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: { xs: 'wrap', md: 'nowrap' }, overflowX: { xs: 'auto', md: 'visible' } }}>
          {plans.map((plan) => (
            <Box key={plan.name} sx={{ minWidth: 300, display: 'flex', flex: { xs: '0 0 auto', md: '1 1 0' }, maxWidth: { xs: 'none', md: '25%' } }}>
              <Paper
                elevation={plan.recommend ? 8 : 2}
                sx={{
                  borderRadius: 4,
                  p: 3,
                  minHeight: 480,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  border: plan.recommend && !plan.button.disabled ? "2px solid #FFA726" : undefined,
                  position: "relative",
                  bgcolor: "#fff",
                  width: 1,
                }}
              >
                {plan.recommend && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 18,
                      right: 18,
                      bgcolor: "#FFF3E0",
                      color: "#FF9800",
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 2,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    가장 추천해요
                  </Box>
                )}
                <Typography fontWeight={700} fontSize={28} mb={1} align="left">
                  {plan.name}
                </Typography>
                <Typography color="grey.600" fontSize={15} mb={2} align="left">
                  {plan.description}
                </Typography>
                <Typography fontWeight={700} fontSize={24} mb={2} align="left">
                  {plan.price}
                </Typography>
                <PlanButton plan={plan} onOrangeClick={() => setProModalOpen(true)} />
                <Divider sx={{ my: 2, width: "100%" }} />
                <Typography fontWeight={700} fontSize={16} mb={1} align="left">
                  하이라이트
                </Typography>
                <Box component="ul" sx={{ pl: 0, m: 0, width: "100%" }}>
                  {plan.highlights.map((hl, i) => (
                    <Box
                      key={i}
                      component="li"
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 15,
                        mb: 1,
                        fontWeight: 500,
                        listStyle: "none",
                        px: 0,
                      }}
                    >
                      <span>{hl.label}</span>
                      <span style={{ minWidth: 32, textAlign: "right", display: "inline-block" }}>{hl.value}</span>
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}