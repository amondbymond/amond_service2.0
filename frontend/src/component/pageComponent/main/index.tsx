import { BodyContainer } from "@/component/ui/BodyContainer";
import { RowStack } from "@/component/ui/BoxStack";
import { primaryColor } from "@/constant/styles/styleTheme";
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TitleTypo28 } from "@/component/ui/styled/StyledTypography";
import { DropDownWithArr } from "@/component/ui/DropDown";
import imageCompression from "browser-image-compression";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { apiCall, handleAPIError } from "@/module/utils/api";
import {
  BaseModalBox,
  ConfirmModal,
  LoadingModalWithVideo,
} from "@/component/ui/Modal";
import { useRouter } from "next/router";
import { categoryList, reasonList } from "@/constant/commonVariable";

export default function MainPage() {
  const [currentStep, setCurrentStep] = useState(0);

  return (
    <div>
      <BodyContainer
        sx={{
          pt: { xs: "50px", md: "60px" },
          pb: { xs: "50px", md: "60px" },
          minHeight: { xs: "calc(100vh - 80px)", md: "calc(100vh - 110px)" },
        }}
      >
        <AnimatePresence mode="wait">
          {currentStep === 0 ? (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <StartSection setCurrentStep={setCurrentStep} />
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <InputSection
                currentStep={currentStep}
                setCurrentStep={setCurrentStep}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </BodyContainer>
    </div>
  );
}

function StartSection({
  setCurrentStep,
}: {
  setCurrentStep: (step: number) => void;
}) {
  return (
    <Box
      sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <RowStack
        justifyContent="center"
        sx={{
          mx: "auto",
          width: { xs: "100%", md: "600px", lg2: "700px" },
          mb: { xs: "28px", md: "40px" },
          mt: { md: "24px" },
        }}
      >
        <video
  src="/assets/video/intro.mp4"
  playsInline
  muted
  autoPlay
  loop
  style={{ width: "100%", height: "auto", borderRadius: "20px" }}
/>

      </RowStack>

      <Typography
        variant="h1"
        fontSize={{ xs: 28, md: 48 }}
        lineHeight={1.3}
        fontWeight={700}
        align="center"
      >
        터지는 인스타 SNS 운영,
        <br />
        <span style={{ color: primaryColor }}>아몬드 하나면 끝.</span>
      </Typography>

      <Typography
        fontSize={{ xs: 16, md: 20 }}
        lineHeight={1.3}
        fontWeight={400}
        align="center"
        sx={{ mt: { xs: "18px", md: "24px" }, mb: { xs: "20px", md: "24px" } }}
      >
        팔로워 증가, 매출 증진, 상품 홍보까지.
        <br />
        <span style={{ color: primaryColor }}>SNS 성장을 위한 콘텐츠</span>가
        필요하신가요?
        <br />
        <br />
        아이디어가 없어도, 시간이 없어도 괜찮아요.
        <br />
        아몬드가
        <span style={{ color: primaryColor }}> 콘텐츠 제작</span>을 도와드려요.
      </Typography>

      <Button
        onClick={() => setCurrentStep(1)}
        sx={{
          fontSize: { xs: "16px", md: "18px" },
          width: { xs: "100%", md: "450px" },
          py: { xs: "7px", md: "8px" },
          mx: "auto",
        }}
      >
        지금 시작하기
      </Button>
    </Box>
  );
}

function InputSection({
  currentStep,
  setCurrentStep,
}: {
  currentStep: number;
  setCurrentStep: (step: number) => void;
}) {
  const router = useRouter();
  const progress = (currentStep / 6) * 100;
  const [brandInput, setBrandInput] = useState({
    name: "",
    category: "",
    url: "",
    reasonList: [],
    description: "",
  });

  const [images, setImages] = useState<File[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [needLoginonfirmModal, setNeedLoginonfirmModal] = useState(false);

  const clickNext = () => {
    if (currentStep === 1) {
      if (brandInput.name === "") {
        alert("브랜드 혹은 상품명을 입력해주세요.");
        return;
      }
    } else if (currentStep === 2) {
      if (brandInput.category === "") {
        alert("카테고리를 선택해주세요.");
        return;
      }
    } else if (currentStep === 3) {
      if (brandInput.url === "") {
        // alert("링크를 입력해주세요.");
        // return;
      } else if (brandInput.url !== "" && !brandInput.url.includes("http")) {
        alert("올바른 링크를 입력해주세요.");
        return;
      }
    } else if (currentStep === 4) {
      if (images.length === 0) {
        // alert("이미지를 업로드해주세요.");
        // return;
      }
    } else if (currentStep === 5) {
      if (brandInput.reasonList.length === 0) {
        alert("이유를 선택해주세요.");
        return;
      }
    } else if (currentStep === 6) {
      if (brandInput.description === "") {
        alert("내용을 입력해주세요.");
        return;
      }
    }

    if (currentStep === 6) {
      saveBrandInput();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const saveBrandInput = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const response = await apiCall({
        url: "/content/project",
        method: "post",
        body: {
          name: brandInput.name,
          category: brandInput.category,
          url: brandInput.url,
          reasonList: brandInput.reasonList,
          description: brandInput.description,
          imageNameList: images.map((image) => image.name),
          imageCount: 4, // Generate 4 images as required
        },
      });

      const { projectId, presignedUrlList, userId } = response.data;
      // presignedUrlList 내에 있는 url로 s3에 이미지 업로드
      await Promise.all(
        presignedUrlList.map(async (url: string, index: number) => {
          await fetch(url, {
            method: "put",
            body: images[index],
            headers: {
              "Content-Type": images[index].type,
            },
          });
        })
      );

      if (userId) {
        router.push(`/project/${projectId}`);
      } else {
        // 로컬 스토리지에 projectId 저장
        localStorage.setItem("amondProjectId", projectId);
        setNeedLoginonfirmModal(true);
      }
    } catch (e) {
      handleAPIError(e, "콘텐츠 생성 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <RowStack
        justifyContent="space-between"
        sx={{
          mt: { md: "30px" },
          mb: { xs: "12px", md: "24px" },
          width: { xs: 1, md: "500px" },
        }}
      >
        <Box sx={{ width: "50px" }}>
          {currentStep > 1 && (
            <IconButton
              onClick={() => setCurrentStep(currentStep - 1)}
              sx={{ p: 0 }}
            >
              <ArrowBackIcon />
            </IconButton>
          )}
        </Box>
        <Typography fontWeight={600} fontSize={{ xs: 15, md: 18 }}>
          {currentStep}/6
        </Typography>
        <Box sx={{ width: "50px" }} />
      </RowStack>

      <Box
        sx={{
          width: "100%",
          height: "8px",
          backgroundColor: "#E0E0E0",
          borderRadius: "4px",
          overflow: "hidden",
          maxWidth: "500px",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          style={{
            height: "100%",
            backgroundColor: primaryColor,
            borderRadius: "4px",
          }}
        />
      </Box>

      <Box
        sx={{
          mt: "32px",
          mb: { xs: "16px", md: "24px" },
          width: { xs: 1, md: "auto" },
        }}
      >
        {currentStep === 1 && (
          <Step1 setBrandInput={setBrandInput} brandInput={brandInput} />
        )}
        {currentStep === 2 && (
          <Step2 setBrandInput={setBrandInput} brandInput={brandInput} />
        )}

        {currentStep === 3 && (
          <Step3 setBrandInput={setBrandInput} brandInput={brandInput} />
        )}

        {currentStep === 4 && <Step4 setImages={setImages} images={images} />}

        {currentStep === 5 && (
          <Step5 setBrandInput={setBrandInput} brandInput={brandInput} />
        )}

        {currentStep === 6 && (
          <Step6 setBrandInput={setBrandInput} brandInput={brandInput} />
        )}
      </Box>

      <Button
        onClick={clickNext}
        sx={{
          fontSize: { xs: "15px", md: "18px" },
          width: { xs: "100%", md: "240px" },
          py: { xs: "6px", md: "6px" },
          mx: "auto",
        }}
      >
        {currentStep === 6 ? "콘텐츠 생성하기" : "작성완료"}
      </Button>

      {isLoading && (
        <LoadingModalWithVideo
          modalSwitch={isLoading}
          setModalSwitch={setIsLoading}
        />
      )}

      {needLoginonfirmModal && (
        <ConfirmModal
          modalSwitch={needLoginonfirmModal}
          setModalSwitch={setNeedLoginonfirmModal}
          title="로그인 페이지 이동"
          func={() => router.push("/login")}
          contents={
            "콘텐츠 생성을 위해 로그인이 필요합니다.\n로그인하시면 입력하셨던 내용들은 자동으로 저장됩니다."
          }
          buttonLabel="확인"
          disableCloseIcon={true}
          disableOutClick
        />
      )}
    </Box>
  );
}

function Step1({
  brandInput,
  setBrandInput,
}: {
  brandInput: any;
  setBrandInput: Function;
}) {
  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        내가 판매하고자 하는
        <br />
        <span style={{ color: primaryColor }}>브랜드명이나 상품명</span>을
        작성해주세요.
      </TitleTypo28>

      <Typography align="center" sx={{ mt: "20px", mb: "20px" }}>
        내 서비스/상품의 브랜드명을 작성해주세요.
        <br />
        브랜드명이 없다면 <span style={{ color: primaryColor }}>가칭</span>으로
        적어주셔도 괜찮습니다.
      </Typography>

      <TextField
        placeholder="예) 아몬드 또는 amond"
        sx={{ width: { xs: "100%", md: "500px" } }}
        value={brandInput.name}
        onChange={(e) => setBrandInput({ ...brandInput, name: e.target.value })}
      />
    </>
  );
}

function Step2({
  brandInput,
  setBrandInput,
}: {
  brandInput: any;
  setBrandInput: Function;
}) {
  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        <span style={{ color: primaryColor }}>상품(혹은 서비스) </span>
        카테고리를 선택해주세요.
      </TitleTypo28>

      <Typography align="center" sx={{ mt: "20px", mb: "20px" }}>
        내 SNS 계정을 대표하는 카테고리를 선택해주세요.
      </Typography>

      <RowStack justifyContent="center">
        <DropDownWithArr
          selectList={categoryList}
          value={brandInput.category}
          onChange={(value) =>
            setBrandInput({ ...brandInput, category: value })
          }
          initialLabel="내 상품 혹은 서비스의 카테고리를 선택해주세요."
          sx={{ width: { md: "450px" } }}
        />
      </RowStack>
    </>
  );
}

function Step3({
  brandInput,
  setBrandInput,
}: {
  brandInput: any;
  setBrandInput: Function;
}) {
  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        내 상품,서비스를 대표하는
        <span style={{ color: primaryColor }}> 링크</span>를
        <br />
        알려주세요.
      </TitleTypo28>

      <Typography align="center" sx={{ mt: "20px", mb: "20px" }}>
        선택사항으로, 홈페이지, 블로그 포스팅 등
        <br />내 서비스나 상품을 소개하고 있는 링크가 있다면 공유해주세요.
      </Typography>

      <TextField
        placeholder="https:// "
        sx={{ width: { xs: 1, md: "500px" } }}
        value={brandInput.url}
        onChange={(e) => setBrandInput({ ...brandInput, url: e.target.value })}
      />
    </>
  );
}

function Step4({ setImages, images }: { setImages: Function; images: File[] }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    // 파일 이름으로만 중복 체크
    const filteredFiles = selectedFiles.filter(
      (file) => !images.some((img) => img.name === file.name)
    );

    // browser-image-compression으로 2MB 이하로 압축
    const options = {
      maxSizeMB: 2,
      useWebWorker: true,
    };
    const compressedFiles = await Promise.all(
      filteredFiles.map((file) =>
        file.size > 2 * 1024 * 1024 ? imageCompression(file, options) : file
      )
    );

    const totalFiles = images.length + compressedFiles.length;
    if (totalFiles > 5) {
      alert("이미지는 최대 5장까지 업로드할 수 있습니다.");
      return;
    }
    if (compressedFiles.length < selectedFiles.length) {
      alert("이미 업로드한 이미지가 포함되어 있습니다.");
    }
    setImages((prev: File[]) => [...prev, ...compressedFiles]);

    // 파일 input 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = (idx: number) => {
    setImages((prev: File[]) => prev.filter((_, i) => i !== idx));
  };

  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        내 상품,서비스를 대표하는
        <span style={{ color: primaryColor }}> 이미지</span>를
        <br />
        <span style={{ color: primaryColor }}>1장 이상 업로드</span>해주세요.
      </TitleTypo28>

      <Typography
        align="center"
        lineHeight={1.55}
        sx={{ mt: "20px", mb: "20px" }}
      >
        필수는 아니지만 내 서비스와 상품의 연출컷, 대표 이미지 등을 1장 이상
        삽입하면
        <br />
        나의 서비스와 상품 홍보에 더욱 적합한 콘텐츠를 얻으실 수 있어요!
        <br />
        ex) 서비스/상품/로고/인물의 누끼사진, 대표 연출컷 등
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Button
          variant="outlined"
          component="label"
          disabled={images.length >= 5}
          sx={{ mb: "16px" }}
        >
          이미지 업로드 (최대 5장)
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleImageChange}
            disabled={images.length >= 5}
          />
        </Button>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {images.map((img, idx) => (
            <Box
              key={idx}
              sx={{
                width: 120,
                height: 120,
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
                border: "1px solid #eee",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#fafafa",
              }}
            >
              <img
                src={URL.createObjectURL(img)}
                alt={`preview-${idx}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <Button
                size="small"
                onClick={() => handleRemoveImage(idx)}
                sx={{
                  minWidth: 0,
                  width: 24,
                  height: 24,
                  position: "absolute",
                  top: 4,
                  right: 4,
                  background: "rgba(0,0,0,0.5)",
                  color: "white",
                  borderRadius: "50%",
                  p: 0,
                  zIndex: 2,
                  fontWeight: 700,
                  fontSize: 18,
                  lineHeight: 1,
                  "&:hover": {
                    background: "rgba(0,0,0,0.7)",
                  },
                }}
              >
                ×
              </Button>
            </Box>
          ))}
        </Box>
      </Box>
    </>
  );
}

function Step5({
  brandInput,
  setBrandInput,
}: {
  brandInput: any;
  setBrandInput: Function;
}) {
  const handleToggle = (reason: string) => {
    if (brandInput.reasonList.includes(reason)) {
      setBrandInput({
        ...brandInput,
        reasonList: brandInput.reasonList.filter((r: string) => r !== reason),
      });
    } else {
      if (brandInput.reasonList.length >= 3) {
        alert("최대 3개까지만 선택 가능합니다.");
        return;
      }
      setBrandInput({
        ...brandInput,
        reasonList: [...brandInput.reasonList, reason],
      });
    }
  };

  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        해당 서비스와 상품 SNS 계정을
        <br />
        <span style={{ color: primaryColor }}>운영하는 가장 큰 이유</span>가
        뭔가요?
      </TitleTypo28>
      <Typography align="center" sx={{ mt: "20px", mb: "20px" }}>
        복수 선택 가능합니다. 최대 3가지를 선택해주세요.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={{ xs: "12px", md: "16px" }}>
          {reasonList.map((reason) => {
            const selected = brandInput.reasonList.includes(reason);
            return (
              <Grid key={reason} size={{ xs: 12, md: 6 }}>
                <Box
                  onClick={() => handleToggle(reason)}
                  sx={{
                    cursor: "pointer",
                    px: 2.5,
                    py: 1.2,
                    borderRadius: "12px",
                    border: `1.7px solid ${
                      selected ? primaryColor : "#E6E6E6"
                    }`,
                    background: "#fff",
                    color: selected ? primaryColor : "#999999",
                    fontWeight: 600,
                    fontSize: { xs: "15px", md: "16px" },
                    transition: "all 0.15s",
                    userSelect: "none",
                    minWidth: "120px",
                    textAlign: "center",
                  }}
                >
                  {reason}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    </>
  );
}

function Step6({
  brandInput,
  setBrandInput,
}: {
  brandInput: any;
  setBrandInput: Function;
}) {
  return (
    <>
      <TitleTypo28 align="center" lineHeight={1.4}>
        다 왔어요! 내 상품 및 서비스의
        <br />
        최신 이슈나 홍보할 내용이 있다면 알려주세요.
      </TitleTypo28>

      <Typography align="center" sx={{ mt: "20px", mb: "20px" }}>
        SNS 콘텐츠 안에 녹일 해당 제품의 특장점이나 할인 정보,
        <br />
        최신 이슈 등 꼭 강조할 내용이 있다면 알려주세요.
      </Typography>

      <TextField
        placeholder="현재 학원을 운영하는 용인 지역 안에서는 꽤 좋은 반응도 들어오고 매출도 좋은데, 전국적으로 나의 영향력을 높이는 게 목표야. 내 서비스와 브랜드에 대한 영향력을 강조해줘. 그리고 내가 가진 성인,아동 스피치에 대한 전문성을 강조해줘."
        sx={{ width: { xs: 1, md: "500px" } }}
        value={brandInput.description}
        onChange={(e) =>
          setBrandInput({ ...brandInput, description: e.target.value })
        }
        multiline
        rows={2}
        inputProps={{
          maxLength: 1000,
        }}
      />
    </>
  );
}
