import MainPage from "@/component/pageComponent/main";
import Head from "next/head";

export default function Main() {
  return (
    <>
      <Head>
        <title>아몬드</title>
        <meta
          name="description"
          content="주제별 트렌드에 딱 맞는 터지는 콘텐츠 기획을 쉽고 간편하게 시작해보세요!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <MainPage />
      </main>
    </>
  );
}
