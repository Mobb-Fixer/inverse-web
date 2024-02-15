import Head from 'next/head';

export default function Page() {
  return (
    <>
      <Head>        
        <title>Thank you for completing the quizz!</title>
        <meta property="og:title" content="Thank you for completing the quizz!" />
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="http://localhost:3000/assets/sDOLA.x512.png" />
        <meta property="og:image" content="http://localhost:3000/assets/sDOLA.x512.png" />
      </Head>   
    </>
  );
}
