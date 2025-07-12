import { Box, Button, Typography, Tooltip } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { primaryColor } from "@/constant/styles/styleTheme";
import { apiCall, handleAPIError } from "@/module/utils/api";

interface SummarizationProps {
  brandInput: any;
  images: File[];
  scrapedImages: File[];
  hasUrl: boolean | null;
  selectedImages: Set<string>;
  onGenerateContent: () => void;
  onGenerateImages?: () => void;
}

// Utility function to calculate relative luminance and determine if color is light or dark
const isLightColor = (color: string): boolean => {
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
  }
  
  return false;
};

function ColorDisplay({ color, text }: { color: string; text: string }) {
  const isLight = isLightColor(color);
  const textColor = isLight ? '#000000' : '#FFFFFF';
  const shadowColor = isLight ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)';
  
  return (
    <Tooltip title={`색상 코드: ${color}`} arrow>
      <span
        style={{
          color: textColor,
          backgroundColor: color,
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          margin: "0 2px",
          textShadow: `0 1px 2px ${shadowColor}`,
          border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}`,
          display: 'inline-block',
          minWidth: 'fit-content',
        }}
      >
        {text}
      </span>
    </Tooltip>
  );
}

function BrandNameDisplay({ text }: { text: string }) {
  return (
    <span
      style={{
        fontWeight: 700,
        color: primaryColor,
        padding: '1px 3px',
        borderRadius: '3px',
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
      }}
    >
      {text}
    </span>
  );
}

export function parseSummaryForDisplay(summary: string, brandName: string) {
  const elements: (string | JSX.Element)[] = [];
  let lastIndex = 0;
  let keyIndex = 0;

  // Pattern for brand name highlighting
  const brandNameRegex = new RegExp(`\\b(${brandName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`, 'g');
  
  // Pattern for color display
  const colorRegex = /"mainColorHex":\s*"([^"]+),\s*(#[0-9A-Fa-f]{6})"/g;

  // Collect all matches
  const matches: Array<{
    type: 'brand' | 'color';
    match: RegExpMatchArray;
    start: number;
    end: number;
  }> = [];

  // Find brand name matches
  let brandMatch;
  while ((brandMatch = brandNameRegex.exec(summary)) !== null) {
    matches.push({
      type: 'brand',
      match: brandMatch,
      start: brandMatch.index,
      end: brandNameRegex.lastIndex
    });
  }

  // Find color matches
  let colorMatch;
  while ((colorMatch = colorRegex.exec(summary)) !== null) {
    matches.push({
      type: 'color',
      match: colorMatch,
      start: colorMatch.index,
      end: colorRegex.lastIndex
    });
  }

  // Sort matches by position
  matches.sort((a, b) => a.start - b.start);

  // Build elements array
  matches.forEach((item, index) => {
    // Add text before this match
    if (item.start > lastIndex) {
      const textBefore = summary.slice(lastIndex, item.start);
      const segments = textBefore.split(/(\n)/);
      segments.forEach((segment, i) => {
        if (segment === "\n") {
          elements.push(<br key={`br-${lastIndex + i}`} />);
        } else {
          elements.push(segment);
        }
      });
    }

    // Add the styled element
    if (item.type === 'brand') {
      elements.push(
        <BrandNameDisplay 
          key={`brand-${keyIndex++}`} 
          text={item.match[1]} 
        />
      );
    } else if (item.type === 'color') {
      elements.push(
        <ColorDisplay
          key={`color-${keyIndex++}`}
          color={item.match[2]}
          text={item.match[1]}
        />
      );
    }

    lastIndex = item.end;
  });

  // Add remaining text
  if (lastIndex < summary.length) {
    const remaining = summary.slice(lastIndex);
    const segments = remaining.split(/(\n)/);
    segments.forEach((segment, i) => {
      if (segment === "\n") {
        elements.push(<br key={`br-tail-${lastIndex + i}`} />);
      } else {
        elements.push(segment);
      }
    });
  }

  return elements;
}

// Utility function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export default function Summarization({
  brandInput,
  images,
  scrapedImages,
  hasUrl,
  selectedImages,
  onGenerateContent,
  onGenerateImages,
}: SummarizationProps) {
  const [summary, setSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState<string>("");
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const hasInitialized = useRef(false);

  // Generate brand summary using OpenAI API
  const generateBrandSummary = async () => {
    if (isLoadingSummary) return;
    try {
      setIsLoadingSummary(true);
      setError("");
      
      // Collect selected images with their base64 data
      const selectedImageInfo: Array<{
        fileName: string;
        type: 'manual' | 'scraped';
        index: number;
        base64: string;
      }> = [];
      
      // Process manual images
      for (let idx = 0; idx < images.length; idx++) {
        const img = images[idx];
        const imageKey = `manual-${idx}`;
        if (selectedImages.has(imageKey)) {
          try {
            const base64Data = await fileToBase64(img);
            selectedImageInfo.push({ 
              fileName: img.name, 
              type: 'manual', 
              index: idx,
              base64: base64Data
            });
          } catch (error) {
            // Error handling for manual image conversion
          }
        }
      }
      
      // Process scraped images
      for (let idx = 0; idx < scrapedImages.length; idx++) {
        const img = scrapedImages[idx];
        const imageKey = `scraped-${idx}`;
        if (selectedImages.has(imageKey)) {
          try {
            const base64Data = await fileToBase64(img);
            selectedImageInfo.push({ 
              fileName: img.name, 
              type: 'scraped', 
              index: idx,
              base64: base64Data
            });
          } catch (error) {
            // Error handling for scraped image conversion
          }
        }
      }
      
      const response = await apiCall({
        url: "/content/brand-summary",
        method: "post",
        body: {
          brandName: brandInput.name,
          category: brandInput.category,
          reasons: brandInput.reasonList,
          description: brandInput.description,
          hasUrl: hasUrl,
          url: brandInput.url,
          selectedImages: selectedImageInfo,
          imageCount: selectedImages.size,
        },
      });
      
      if (response.data.summary) {
        setSummary(response.data.summary);
      }
      
    } catch (e) {
      setError("브랜드 요약 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
      handleAPIError(e, "브랜드 요약 생성 실패");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (!summary && !isLoadingSummary && !hasInitialized.current) {
      hasInitialized.current = true;
      generateBrandSummary();
    }
  }, []);

  // Function to safely get image URL with error handling
  const getImageUrl = (file: File, key: string) => {
    try {
      let url = imageUrls.get(key);
      
      if (!url) {
        const newUrl = URL.createObjectURL(file);
        if (newUrl) {
          setImageUrls(prev => new Map(prev).set(key, newUrl));
          url = newUrl;
        } else {
          return '';
        }
      }
      
      return url;
    } catch (error) {
      return '';
    }
  };

  // Cleanup effect for image URLs
  useEffect(() => {
    return () => {
      imageUrls.forEach(url => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // Ignore revoke errors
        }
      });
    };
  }, []);

  // Update image URLs when images change
  useEffect(() => {
    const refreshImageUrls = () => {
      setImageUrls(prevUrls => {
        const newImageUrls = new Map<string, string>();
        
        images.forEach((img, idx) => {
          const key = `manual-${idx}`;
          try {
            const url = URL.createObjectURL(img);
            if (url) {
              newImageUrls.set(key, url);
            }
          } catch (error) {
            // Error handling for manual image URL creation
          }
        });
        
        scrapedImages.forEach((img, idx) => {
          const key = `scraped-${idx}`;
          try {
            const url = URL.createObjectURL(img);
            if (url) {
              newImageUrls.set(key, url);
            }
          } catch (error) {
            // Error handling for scraped image URL creation
          }
        });
        
        // Clean up old URLs
        prevUrls.forEach((url, key) => {
          if (!newImageUrls.has(key)) {
            try {
              URL.revokeObjectURL(url);
            } catch (e) {
              // Ignore revoke errors
            }
          }
        });
        
        return newImageUrls;
      });
    };

    const timer = setTimeout(refreshImageUrls, 50);
    return () => clearTimeout(timer);
  }, [images, scrapedImages]);

  const displayContent = summary || (isLoadingSummary ? '요약을 불러오는 중입니다...' : '요약이 없습니다.');
  const parsedSummary = parseSummaryForDisplay(displayContent, brandInput.name || '');

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 6, mb: 8, px: { xs: 2, md: 3 } }}>

      <Box sx={{
        background: "#f5f5f5",
        borderRadius: "20px",
        px: 3,
        py: 2,
        mb: 2,
        display: "inline-block",
        position: "relative",
        fontWeight: 500,
        color: "#444"
      }}>
        내가 작성한 정보 다시 확인해줄 수 있어?
        <Box sx={{
          position: "absolute",
          left: 30,
          bottom: -12,
          width: 0,
          height: 0,
          borderLeft: "12px solid transparent",
          borderRight: "12px solid transparent",
          borderTop: "12px solid #f5f5f5"
        }} />
      </Box>

      <Box sx={{
        background: "#fff7f1",
        borderRadius: 3,
        p: 3,
        mb: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        minHeight: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Typography
          sx={{
            fontSize: '1.15rem',
            fontWeight: 500,
            color: '#333',
            whiteSpace: 'pre-line',
            lineHeight: 1.9,
            textAlign: 'left',
            wordBreak: 'keep-all',
            width: '100%',
          }}
        >
          {parsedSummary}
        </Typography>
      </Box>

      {/* Images Section - Only show selected images */}
      {selectedImages.size > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
            선택된 이미지들
          </Typography>
          
          {/* Selected Images Grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))",
              gap: 1.5,
              maxWidth: 400,
              mx: "auto",
              mb: 2
            }}
          >
            {/* Manual Images */}
            {images.map((img, idx) => {
              const imageKey = `manual-${idx}`;
              const isSelected = selectedImages.has(imageKey);
              
              if (!isSelected) return null;
              
              return (
                <Box
                  key={`${img.name}-${idx}-${img.lastModified}`}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    position: "relative",
                    border: `2px solid ${primaryColor}`,
                    background: "#f5f5f5",
                  }}
                >
                  <img
                    src={getImageUrl(img, imageKey)}
                    alt={`preview-${idx}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: primaryColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </Box>
                </Box>
              );
            })}

            {/* Scraped Images */}
            {scrapedImages.map((img, idx) => {
              const imageKey = `scraped-${idx}`;
              const isSelected = selectedImages.has(imageKey);
              
              if (!isSelected) return null;
              
              return (
                <Box
                  key={`${img.name}-${idx}-${img.lastModified}`}
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: 1.5,
                    overflow: "hidden",
                    position: "relative",
                    border: `2px solid ${primaryColor}`,
                    background: "#f5f5f5",
                  }}
                >
                  <img
                    src={getImageUrl(img, imageKey)}
                    alt={`scraped-preview-${idx}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: primaryColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  >
                    ✓
                  </Box>
                </Box>
              );
            })}
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: "#666", mb: 0.5 }}>
              선택된 이미지: {selectedImages.size}장
            </Typography>
          </Box>
        </Box>
      )}
      
      {error && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 2 }}>
          <Typography sx={{ color: "#d32f2f", fontWeight: 600, textAlign: "center", mb: 1 }}>
            {error}
          </Typography>
          <Button
            onClick={generateBrandSummary}
            variant="outlined"
            sx={{
              borderColor: primaryColor,
              color: primaryColor,
              '&:hover': {
                borderColor: primaryColor,
                background: primaryColor,
                color: "white",
              }
            }}
          >
            다시 시도
          </Button>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
        <Button
          fullWidth
          variant="contained"
          color="warning"
          sx={{ fontWeight: 700, fontSize: "18px", py: 1.5, borderRadius: "12px" }}
          onClick={onGenerateContent}
          disabled={isLoadingSummary || !!error}
        >
          이대로 콘텐츠 생성하기!
        </Button>
        {onGenerateImages && (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            sx={{ fontWeight: 700, fontSize: "18px", py: 1.5, borderRadius: "12px" }}
            onClick={onGenerateImages}
            disabled={isLoadingSummary || !!error}
          />
        )}
      </Box>
    </Box>
  );
}