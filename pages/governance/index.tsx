import { Flex } from '@chakra-ui/react'
import { ActiveProposals, RecentProposals, DelegatesPreview, VotingPower } from '@inverse/components/Governance'
import Layout from '@inverse/components/Layout'
import { AppNav } from '@inverse/components/Navbar'

export const Governance = () => (
  <Layout>
    <AppNav active="Governance" />
    <Flex w="full" justify="center" direction={{ base: 'column', xl: 'row' }}>
      <Flex direction="column">
        <Flex w={{ base: 'full', xl: '4xl' }} justify="center">
          <ActiveProposals />
        </Flex>
        <Flex w={{ base: 'full', xl: '4xl' }} justify="center">
          <RecentProposals />
        </Flex>
      </Flex>
      <Flex direction="column">
        <Flex w={{ base: 'full', xl: 'sm' }} justify="center">
          <VotingPower />
        </Flex>
        <Flex w={{ base: 'full', xl: 'sm' }} justify="center">
          <DelegatesPreview />
        </Flex>
      </Flex>
    </Flex>
  </Layout>
)

export default Governance
