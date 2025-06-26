import { s3ImageUrl } from "@/constant/commonVariable";
import { changeDateDash } from "@/module/utils/commonFunction";
import { Box, CardMedia, Typography } from "@mui/material";

export default function InstagramFeedGrid({
  contentDataList,
  onContentClick,
}: {
  contentDataList: any[];
  onContentClick: (content: any) => void;
}) {
  if (!contentDataList) return null;

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: { xs: '8px', md: '16px' },
        width: '100%',
      }}
    >
      {contentDataList.slice(0, 4).map((content) => (
        <Box
          key={content.id}
          onClick={() => onContentClick(content)}
          sx={{
            width: '100%',
            aspectRatio: '1/1',
            bgcolor: 'grey.100',
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
            overflow: 'hidden',
            '&:hover': { opacity: 0.9 },
            border: '0.5px solid #EAEAEA',
          }}
        >
          <Typography
            sx={{
              position: 'absolute',
              top: { xs: 6, md: 10 },
              right: { xs: 6, md: 10 },
              fontSize: { xs: 11, md: 13 },
              bgcolor: 'rgba(255,255,255,0.9)',
              borderRadius: 1,
              px: { xs: 0.5, md: 1 },
              fontWeight: 500,
            }}
          >
            {changeDateDash(content.postDate)}
          </Typography>
          {content.imageUrl ? (
            <CardMedia
              component="img"
              src={`${s3ImageUrl}/${content.imageUrl}`}
              alt={content.subject}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'grey.500',
                fontSize: { xs: 13, md: 14 },
              }}
            >
              이미지 생성중...
            </Box>
          )}
          {content.videoScript && (
            <Box
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                zIndex: 2,
                bgcolor: 'rgba(0,0,0,0.45)',
                borderRadius: '50%',
                width: { xs: 14, md: 28 },
                height: { xs: 14, md: 28 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 16 16"
                fill="white"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="8" cy="8" r="8" fill="none" />
                <polygon points="6,4.5 12,8 6,11.5" fill="white" />
              </svg>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}
