import { Stack, VStack } from '@chakra-ui/react'
import Layout from '@app/components/common/Layout'
import { AppNav } from '@app/components/common/Navbar'
import Head from 'next/head';
import { useAccount } from '@app/hooks/misc';
import { DsaUI } from '@app/components/sDola/DsaUI';
import { DsaInfos } from '@app/components/sDola/DsaInfos';
import { useStakedDolaActivity } from '@app/components/sDola/StakeDolaActivity';

export const DOLASavingsAccountPage = () => {
  // const account = useAccount();
  // const { isLoading, accountEvents, events } = useStakedDolaActivity(account, 'dsa');
  return (
    <Layout>
      <Head>
        <title>Inverse Finance - DOLA Savings Account</title>
        <meta name="og:title" content="Inverse Finance - DOLA Savings Account" />
        <meta name="og:description" content="DOLA Savings Account" />
        <meta name="description" content="DOLA Savings Account" />
        <meta name="keywords" content="Inverse Finance, swap, stablecoin, DOLA, DBR" />
      </Head>
      <AppNav active="Swap" />
      <VStack
        w={{ base: 'full', lg: '1000px' }}
        mt='6'
        spacing="8"
        px={{ base: '4', lg: '0' }}
      >
        <Stack
          spacing="0"
          alignItems="space-between"
          justify="space-between"
          w='full'
          direction={{ base: 'column', xl: 'row' }}
        >
          <VStack alignItems="flex-start" w={{ base: 'full', lg: '55%' }}>
            <DsaUI />
          </VStack>
          <Stack alignItems="flex-end" w={{ base: 'full', lg: '45%' }}>
            <DsaInfos />
          </Stack>
        </Stack>
        {/* <StakeDolaActivity events={accountEvents} /> */}
      </VStack>
    </Layout>
  )
}

export default DOLASavingsAccountPage