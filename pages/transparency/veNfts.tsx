import { ErrorBoundary } from '@app/components/common/ErrorBoundary'
import Layout from '@app/components/common/Layout'
import { AppNav } from '@app/components/common/Navbar'
import Head from 'next/head'
import { TransparencyTabs } from '@app/components/Transparency/TransparencyTabs'
import { VeNftEvolutionWrapper } from '@app/components/Transparency/VeNftEvolution'
import { HStack, VStack, Image, Text } from '@chakra-ui/react'

export const F2UsersPage = () => {

    return (
        <Layout>
            <Head>
                <title>Inverse Finance - VeNfts</title>
            </Head>
            <AppNav active="Transparency" activeSubmenu="FiRM users" hideAnnouncement={true} />
            <TransparencyTabs active="firm-users" />            
            <ErrorBoundary>
                <VStack pt="4" spacing="4" w='full' maxW={{ base: '94%', '2xl': '90rem' }}>
                    <HStack alignItems="center" justify="space-between" w='full'>
                        <Text fontWeight="extrabold" fontSize="40px">Inverse Finance's veNfts Dashboard</Text>
                        <Image borderRadius="5px" display={{ base: 'none', sm: 'inline-block' }} w='200px' src={`/assets/inverse-logo-banner.png?`} />
                    </HStack>
                    <ErrorBoundary description="Failed to Dashboard">
                        <VeNftEvolutionWrapper />
                    </ErrorBoundary>
                </VStack>
            </ErrorBoundary>
        </Layout>
    )
}

export default F2UsersPage
