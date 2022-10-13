import { Bond } from '@app/types';
import { shortenNumber } from '@app/util/markets';
import { Stack, Flex, Text, VStack, HStack } from '@chakra-ui/react';
import { SubmitButton } from '@app/components/common/Button';
import { UnderlyingItem } from '@app/components/common/Assets/UnderlyingItem';
import moment from 'moment';
import { useWeb3React } from '@web3-react/core';

const formatBondPrice = (bondPrice: number) => {
    return shortenNumber(bondPrice, 2, true);
}

const formatROI = (roi: number) => {
    return `${shortenNumber(roi, 2, false)}%`;
}

export const BondListItem = ({ bond, bondIndex, handleDetails }: { bond: Bond, bondIndex: number, handleDetails: (i: number) => void }) => {
    const { account } = useWeb3React();    
    return (
        <Stack
            borderTop={{ base: bondIndex > 0 ? `1px solid #cccccc33` : 'none', sm: `1px solid #cccccc33` }}
            pt={{ base: bondIndex > 0 ? '2' : '0', sm: '2' }}
            direction="row" key={bond.input} w='full' justify="space-between" fontWeight="bold">
            <Flex w="180px" alignItems="center" position="relative">
                {/* <Link textTransform="uppercase" textDecoration="none" isExternal href={bond.howToGetLink}> */}
                <VStack alignItems="flex-start" textTransform="uppercase">
                    <UnderlyingItem Container={HStack} label={bond.underlying.symbol} imgSize={18} image={bond.underlying.image} protocolImage={bond.underlying.protocolImage}
                        imgContainerProps={{ mr: '1' }}
                    />
                    <Text maxW={{ base: "80px", sm: '200px' }} fontSize={{ base: '10px', sm: "14px" }} color="secondaryTextColor">{bond.vestingDays} days vesting</Text>
                </VStack>
                {/* </Link> */}
            </Flex>
            <Flex w="150px" alignItems="center">
                {bond.conclusion ? moment(bond.conclusion).format('MMM Do YYYY') : '-'}
            </Flex>
            <Flex w="80px" alignItems="center">
                {bond.bondPrice ? formatBondPrice(bond.bondPrice) : '-'}
            </Flex>
            <Flex w="80px" justify="flex-end" alignItems="center" color={bond.roi === 0 || isNaN(bond.roi) ? 'mainTextColor' : bond.positiveRoi ? 'secondary' : 'error'}>
                {bond.roi ? formatROI(bond.roi) : '-'}
            </Flex>
            <Flex w='80px' position="relative" alignItems="center">
                <SubmitButton w='full' onClick={() => handleDetails(bondIndex)} disabled={!account}>
                    Bond
                </SubmitButton>
            </Flex>
        </Stack>
    )
}