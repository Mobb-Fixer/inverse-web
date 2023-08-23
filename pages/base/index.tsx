import { Stack, VStack, Text, Box } from '@chakra-ui/react'
import Layout from '@app/components/common/Layout'
import { AppNav } from '@app/components/common/Navbar'
import Head from 'next/head';
import { BaseBridge } from '@app/components/Base/BaseBridge';
import { InfoMessage, WarningMessage } from '@app/components/common/Messages';
import Link from '@app/components/common/Link';
import Container from '@app/components/common/Container';
import { BaseWithdrawlsProcess } from '@app/components/Base/BaseWithdrawlsProcess';


export const BasePage = () => {
  return (
    <Layout>
      <Head>
        <title>{process.env.NEXT_PUBLIC_TITLE} - Base</title>
        <meta name="og:title" content="Inverse Finance - Base" />
        <meta name="og:description" content="Base bridging" />
        <meta name="description" content="Base bridging" />
        <meta name="keywords" content="Inverse Finance, swap, bridge, stablecoin, DOLA, DAI, USDT, USDC, INV, DBR" />
      </Head>
      <AppNav active="Swap" activeSubmenu="Base" />
      <VStack
        w={{ base: 'full', lg: '1200px' }}
        justify="center"
        mt='6'
        alignItems="flex-start"
        spacing="8"
        px={{ base: '4', lg: '0' }}
      >
        <Stack
          w='full'
          justify="center"
          direction={{ base: 'column', xl: 'row' }}
          alignItems="flex-start"
          spacing="8"
        >
          <VStack w={{ base: 'full', lg: '55%' }}>
            <BaseBridge />
          </VStack>
          <VStack w={{ base: 'full', lg: '45%' }}>
            <Container label="Informations" noPadding p="0" contentProps={{ minH: '400px' }}>
              <VStack w='full' spacing="4" justify="space-between">
                <WarningMessage
                  alertProps={{ w: 'full' }}
                  title="Bridging times"
                  description={
                    <VStack alignItems="flex-start">
                      <Text>- From Ethereum to Base: up to ~30min.</Text>
                      <Text>- From Base to Ethereum: 7 days, 3 steps required.</Text>
                    </VStack>
                  }
                />

                <InfoMessage
                  description={
                    <VStack alignItems="flex-start">
                      <Box>
                        <Text fontWeight="bold" display="inline">
                          Please note:
                        </Text>
                        <Text ml="1" display="inline">
                          DOLA has been deployed to the native base Bridge however DOLA may not be reflected on
                        </Text>
                        <Link ml="1" textDecoration="underline" href="https://bridge.base.org/deposit" isExternal target="_blank">
                          the official Base UI
                        </Link>
                        <Text display="inline" ml="1">
                          pull-down menu for several weeks.
                        </Text>
                      </Box>
                      <Text>
                        Until then, we are providing this user interface to the Base native bridge for our users wishing to move DOLA to Base.
                      </Text>
                      <Box w='full'>
                        <Text display="inline">
                          For more information on using bridges with DOLA please visit:
                        </Text>
                        <Link ml="1" textDecoration="underline" href="https://docs.inverse.finance/inverse-finance/inverse-finance/product-guide/tokens/dola" isExternal={true} target="_blank">
                          DOLA docs
                        </Link>
                      </Box>
                      <Text>Inverse Finance did not audit the Base native bridge and bridging process and only provides a UI to facilitate early DOLA bridging.</Text>
                    </VStack>
                  }
                />
              </VStack>
            </Container>
          </VStack>
        </Stack>
        <BaseWithdrawlsProcess />
      </VStack>
    </Layout>
  )
}

export default BasePage