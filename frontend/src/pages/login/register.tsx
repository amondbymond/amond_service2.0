import RegisterPage from "@/component/pageComponent/login/register";
import Head from "next/head";

export default function Register() {
  return (
    <>
      <Head>
        <title>회원가입 | amond</title>
        <meta
          name="description"
          content="회원가입 후 주제별 트렌드에 딱 맞는 터지는 콘텐츠 기획을 쉽고 간편하게 시작해보세요!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <RegisterPage />
      </main>
    </>
  );
}
