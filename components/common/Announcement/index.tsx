import { ExternalLinkIcon } from '@chakra-ui/icons'
import { Text } from '@chakra-ui/react'
import { Flex } from '@chakra-ui/layout'
import Link from '@app/components/common/Link'
import { TEST_IDS } from '@app/config/test-ids';
import { useSupplyBalances } from '@app/hooks/useBalances';
import { OLD_XINV } from '@app/config/constants';
import { utils } from 'ethers'

const DefaultMessage = () => {
  return <Link
    pl={1}
    color="#fff"
    isExternal
    href="https://t.me/InverseCompanionBot"
    _hover={{ color: 'purple.100' }}
  >
    Track your Anchor position and receive liquidation risk alerts on Telegram using Inverse Companion Bot{' '}
    <ExternalLinkIcon />
  </Link>
}

const XinvMigrationMessage = () => {
  return <>
    <Text>xINV migration is in progress. Please withdraw funds from <b>INV (OLD)</b> and resupply them into the new <b>INV</b></Text>
  </>
}

export const Announcement = () => {
  const { balances } = useSupplyBalances()
  const needsXinvMigration = balances && balances[OLD_XINV] && Number(utils.formatEther(balances[OLD_XINV])) > 0.1

  return (
    <Flex
      bgColor="purple.600"
      w="full"
      p={1}
      fontSize="sm"
      justify="center"
      textAlign="center"
      alignItems="center"
      fontWeight="semibold"
      color="#fff"
      data-testid={TEST_IDS.announcement}
    >
      {
        needsXinvMigration ? <XinvMigrationMessage /> : <DefaultMessage />
      }
    </Flex>
  )
}
