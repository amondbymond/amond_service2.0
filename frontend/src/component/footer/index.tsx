import { Box, CardMedia, Container, Typography } from "@mui/material";
import { BodyContainer } from "../ui/BodyContainer";
import { RowStack } from "../ui/BoxStack";
import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <Container
        maxWidth={false}
        sx={{
          py: { xs: "6px", md: "12px" },
          backgroundColor: "#FFF",
          borderTop: "1px solid #E1E1E1",
        }}
      >
        <BodyContainer>
          <Typography
            fontSize={{ xs: 11, md: 13 }}
            color="#666666"
            lineHeight="22px"
          >
            Copyright © amond. All rights reserved
          </Typography>
        </BodyContainer>
      </Container>
    </footer>
  );
}
