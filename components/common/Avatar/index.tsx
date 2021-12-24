import { Box, BoxProps } from '@chakra-ui/react'
import Davatar, { DavatarProps } from '@davatar/react';
import { NetworkIds } from '@inverse/types';
import { AlchemyProvider } from '@ethersproject/providers';
import { isAddress } from 'ethers/lib/utils';

export const Avatar = ({
  address,
  defaultAvatar = 'jazzicon',
  sizePx = 20,
  provider,
  ...boxProps
}: {
  address: string,
  sizePx?: number,
  provider?: DavatarProps["provider"],
  defaultAvatar?: 'blockies' | 'jazzicon',
} & Partial<BoxProps>) => {
  // specific key for this usage only
  const alchemyProvider = new AlchemyProvider(Number(NetworkIds.mainnet), 'Im06YX8gmXb3PDPLG7nv3ExIYGppGDvf');
  const avatarAddress = !address || !isAddress(address) ? '0x0000000000000000000000000000000000000000' : address
  return (
    <Box boxSize={`${sizePx}px`} {...boxProps}>
      <Davatar provider={provider || alchemyProvider} size={sizePx} address={avatarAddress} generatedAvatarType={defaultAvatar} />
    </Box>
  )
}
