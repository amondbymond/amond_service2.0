import { Box, Button, Typography, Paper, Divider, Modal, TextField, Checkbox, FormControlLabel } from "@mui/material";
import { useState } from "react";
import { useRouter } from "next/router";
import { apiCall } from "@/module/utils/api";

type MuiButtonColor = 'primary' | 'secondary' | 'inherit' | 'success' | 'error' | 'info' | 'warning';

const plans = [
  {
    name: "베이직",
    description: "처음 아몬드를 접하고 경험하는 분들에게 추천해요",
    price: "무료",
    highlight: "무료 체험",
    highlights: [
      { label: "월 콘텐츠 발행 횟수", value: "1" },
      { label: "콘텐츠별 수", value: "2" },
      { label: "전담 매니저 SNS 컨설팅", value: "X" },
      { label: "팀 멤버 관리/운영 beta", value: "X" },
    ],
    button: { label: "무료체험", color: "default", type: "black", disabled: false },
  },
  {
    name: "프로",
    description: "처음 아몬드를 접하고 경험하는 분들에게 추천해요",
    price: "9,900원/월",
    highlight: "7일간 무료체험",
    highlights: [
      { label: "월 콘텐츠 발행 횟수", value: "4" },
      { label: "콘텐츠별 수", value: "3" },
      { label: "전담 매니저 SNS 컨설팅", value: "X" },
      { label: "팀 멤버 관리/운영 beta", value: "X" },
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
      { label: "월 콘텐츠 발행 횟수", value: "10" },
      { label: "콘텐츠별 수", value: "10" },
      { label: "전담 매니저 SNS 컨설팅", value: "X" },
      { label: "팀 멤버 관리/운영 beta", value: "0" },
    ],
    button: { label: "To Be Continued!", color: "inherit", type: "grey", disabled: true },
  },
  {
    name: "프리미엄",
    description: "처음 아몬드를 접하고 경험하는 분들에게 추천해요",
    price: "79,000원/월",
    highlight: "To Be Continued!",
    highlights: [
      { label: "월 콘텐츠 발행 횟수", value: "무제한" },
      { label: "콘텐츠별 수", value: "무제한" },
      { label: "전담 매니저 SNS 컨설팅", value: "0" },
      { label: "팀 멤버 관리/운영 beta", value: "0" },
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
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <TextField label="이름" size="small" sx={{ flex: 1 }} value="윤지 유" InputProps={{ readOnly: true }} />
          <TextField label="회사 이름(선택)" size="small" sx={{ flex: 1 }} value="아몬드 주식회사" InputProps={{ readOnly: true }} />
        </Box>
        <Typography fontWeight={700} mb={1}>
          결제 수단
        </Typography>
        <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
          <Button variant="outlined" color="warning" sx={{ flex: 1, fontWeight: 700 }}>
            신용 카드
          </Button>
          <Button variant="outlined" sx={{ flex: 1, fontWeight: 700 }}>
            무통장 입금
          </Button>
        </Box>
        <Typography fontWeight={700} mb={1}>
          청구 옵션
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              border: "2px solid #FFA726",
              borderRadius: 2,
              px: 2,
              py: 1,
              display: "flex",
              alignItems: "center",
              mr: 2,
            }}
          >
            <Box
              sx={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "2px solid #FFA726",
                display: "inline-block",
                mr: 1,
                background: "#fff",
              }}
            />
            <Typography fontWeight={500} fontSize={15}>
              월간 결제 <b>₩ 9,900원 / 월</b>
            </Typography>
          </Box>
        </Box>
        <FormControlLabel control={<Checkbox defaultChecked />} label="전체 동의" sx={{ mb: 1 }} />
        <Box sx={{ pl: 3, mb: 3 }}>
          <FormControlLabel control={<Checkbox defaultChecked />} label="구매조건 확인 및 결제진행에 동의" />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 2 }}>
          <Box>
            <Typography fontWeight={700} fontSize={22}>
              ₩ 9,900원 / 월
            </Typography>
          </Box>
          <Box>
            <Button variant="contained" color="warning" sx={{ fontWeight: 700, fontSize: 16, borderRadius: 2 }}>
              프로 요금제로 업그레이드
            </Button>
            <Button variant="outlined" sx={{ ml: 2, color: '#888', borderColor: '#eee', fontWeight: 500, fontSize: 14, mt: 1 }} disabled>
              문의 사항이 있으신가요?
            </Button>
          </Box>
        </Box>
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
      <Box sx={{ textAlign: "center", mt: 8, color: "#888", fontSize: 14 }}>
        Copyright © amond. All rights reserved
      </Box>
    </Box>
  );
}