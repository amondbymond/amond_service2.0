import { useContext, useState } from "react";
import { Box, Button, Typography, Divider } from "@mui/material";
import LoginContext from "@/module/ContextAPI/LoginContext";
import { useRouter } from "next/router";
import { apiCall } from "@/module/utils/api";

const TERMS_URL = "https://sticky-partridge-ee9.notion.site/2172fde8bab680b1b776cb4244d60f9b";

export default function UserSidebar() {
  const { userInfo, setUserInfo } = useContext(LoginContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!userInfo) return null;

  // Use available fields from UserDataType
  const displayName = userInfo.authType || "회원";
  const displayUsername = `@user_${userInfo.id}`;

  const handleLogout = async () => {
    // You may want to call your logout API here
    setUserInfo(null);
    router.push("/login");
  };

  const goToProjectPage = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 100,
        right: 60,
        width: 280,
        bgcolor: "#fff",
        borderRadius: 3,
        boxShadow: 3,
        p: 3,
        display: { xs: "none", md: "block" },
        zIndex: 1200,
      }}
    >
      {/* User Info */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            bgcolor: "#FFA726",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            mr: 2,
          }}
        >
          <Typography fontSize={32} color="#fff">
            {/* User icon (simple) */}
            <span role="img" aria-label="user">👤</span>
          </Typography>
        </Box>
        <Box>
          <Typography fontWeight={700} fontSize={18}>{displayName}</Typography>
          <Typography color="grey.600" fontSize={14}>{displayUsername}</Typography>
        </Box>
      </Box>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Button
          variant="contained"
          color="warning"
          sx={{ flex: 1, fontWeight: 700, borderRadius: 2 }}
          onClick={goToProjectPage}
          disabled={loading}
        >
          내 캘린더
        </Button>
        <Button
          variant="contained"
          sx={{ flex: 1, bgcolor: "#FFF3E0", color: "#FF9800", fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: "#FFE0B2" } }}
          onClick={goToProjectPage}
          disabled={loading}
        >
          새 콘텐츠
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Links and Actions */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Button
          variant="text"
          sx={{ justifyContent: "flex-start", color: "#333" }}
          onClick={() => router.push("/subscribe")}
          disabled={loading}
        >
          구독 결제하기
        </Button>
        <Button
          variant="text"
          sx={{ justifyContent: "flex-start", color: "#333" }}
          onClick={() => window.open(TERMS_URL, "_blank")}
        >
          이용약관
        </Button>
        <Button
          variant="text"
          sx={{ justifyContent: "flex-start", color: "#333" }}
          onClick={() => window.open(TERMS_URL, "_blank")}
        >
          개인정보처리방침
        </Button>
        <Button
          variant="text"
          sx={{ justifyContent: "flex-start", color: "#333" }}
          onClick={() => router.push("/login/findPassword")}
        >
          비밀번호 변경
        </Button>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Button
        variant="text"
        color="error"
        fullWidth
        sx={{ fontWeight: 700 }}
        onClick={handleLogout}
      >
        로그아웃
      </Button>
    </Box>
  );
} 