import { Box, useMediaQuery } from '@chakra-ui/react';
import { namedAddress } from '@app/util';
import { FlowChart } from '@app/components/common/Dataviz/FlowChart';
import { useEffect, useState } from 'react';
import { NamedAddressBox } from '@app/components/common/NamedAddressBox/NamedAddressBox';

const primaryStyle = { backgroundColor: '#5E17EBcc', color: 'white' }

const elementsOptions = {
  yGap: 400,
  xGap: 300,
};

const positions: { [key: string]: { x: number, y: number } } = {
  '0x3fcb35a1cbfb6007f9bc638d388958bc4550cb28': { x: 600, y: -200 },
  '0xb9f43e250dadf6b61872307396ad1b8beba27bcd': { x: 400, y: -50 },
  '0x4b6c63e6a94ef26e2df60b89372db2d8e211f1b7': { x: 0, y: -300 },
  '0x77c64eef5f4781dd6e9405a8a77d80567cfd37e0': { x: 1200, y: -300 },
  '0x07de0318c24d67141e6758370e9d7b6d863635aa': { x: 800, y: -50 },
  '0x41225088326fe055fbf40ad34d862bbd7bd0c9b4': { x: 800, y: 150 },
}

export const MultisigsFlowChart = ({
  multisigs,
}: {
  multisigs: {
    address: string, name: string, owners: string[]
  }[]
}) => {
  const [baseWidth, setBaseWidth] = useState('');
  const [baseheight, setBaseHeight] = useState('');
  const [isLargerThan] = useMediaQuery('(min-width: 400px)')

  useEffect(() => {
    setBaseWidth(`${screen.availWidth || screen.width}px`)
    setBaseHeight(`${(screen.availHeight || screen.height) / 2}px`)
  }, [isLargerThan]);

  const ownersNbMultisig: { [key: string]: number } = {};

  multisigs?.forEach(multisig => {
    multisig.owners.forEach(owner => {
      if (ownersNbMultisig[owner]) { ownersNbMultisig[owner] += 1 }
      else ownersNbMultisig[owner] = 1;
    });
  });

  const links = multisigs?.map((multisig, i) => {
    const multisigX = i * 500;
    let singleOwnerAccX = multisigX;
    const pos = positions[multisig.address.toLowerCase()] || { x: multisigX, y: 0 }
    return {
      label: `👥 ${namedAddress(multisig.address)}`,
      id: multisig.address,
      style: primaryStyle,
      ...pos,
      targets: multisig.owners.map((owner, j) => {

        const isMultiOwner = ownersNbMultisig[owner] > 1;
        const singleOwnerX = singleOwnerAccX;
        if (!isMultiOwner) {
          singleOwnerAccX += 200;
        }
        const ownerPos = positions[owner.toLowerCase()] || {
          x: ownersNbMultisig[owner] > 1 ? multisigX + 400 : singleOwnerX,
          y: ownersNbMultisig[owner] > 1 ? 100 : 400
        }
        return {
          label: <NamedAddressBox children={owner} />,
          id: owner,
          linkLabel: '',
          ...ownerPos,
        }
      })
    }
  }) || [];

  const boxProps = { w: { base: baseWidth, lg: '1000px' }, h: { base: baseheight, lg: '600px' } }

  if (!baseWidth) {
    return <Box {...boxProps}>&nbsp;</Box>
  }

  return (
    <FlowChart
      options={{
        showControls: !isLargerThan,
        showBackground: !isLargerThan,
        autofit: true,
        elementsOptions,
      }}
      flowData={links}
      boxProps={boxProps}
    />
  )
};