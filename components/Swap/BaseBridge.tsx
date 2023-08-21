import { useState } from "react";
import { SimpleAmountForm } from "../common/SimpleAmountForm"
import { BASE_L1_ERC20_BRIDGE, BASE_L2_ERC20_BRIDGE, bridgeDolaToBase, withdrawDolaFromBase } from "@app/util/base";
import { getNetworkConfigConstants } from "@app/util/networks";
import { useWeb3React } from "@web3-react/core";
import { VStack, Text, HStack, Image } from "@chakra-ui/react";
import { InfoMessage, SuccessMessage } from "../common/Messages";
import Link from "../common/Link";
import { ArrowForwardIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import Container from "../common/Container";
import { NavButtons } from "../common/Button";
import { useDOLABalance } from "@app/hooks/useDOLA";
import { BigNumber } from "ethers";
import { Input } from "../common/Input";
import { TextInfo } from "../common/Messages/TextInfo";

const { DOLA } = getNetworkConfigConstants();

export const BaseBridge = () => {
    const { provider, account } = useWeb3React();
    const { balance: dolaBalance, bnBalance: bnDolaBalance } = useDOLABalance(account);
    const signer = !!provider ? provider?.getSigner() : undefined;
    const [amount, setAmount] = useState('');
    const [to, setTo] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [isCustomAddress, setIsCustomAddress] = useState(false);
    const [mode, setMode] = useState<'Deposit' | 'Withdraw'>('Deposit');

    const handleAction = (bnAmount: BigNumber) => {
        if (!signer) return;
        if (mode === 'Withdraw') {
            return withdrawDolaFromBase(bnAmount, signer);
        }
        return bridgeDolaToBase(bnAmount, signer);
    }

    const handleSuccess = () => {
        setIsSuccess(true);
        setAmount('');
    }

    return <Container
        label="Base Native Bridge"
        noPadding
        p="0"
        contentProps={{ direction: 'column' }}
    >
        {
            !account ? <InfoMessage alertProps={{ w: 'full' }} description="Please connect your wallet" />
                : <VStack spacing="4">
                    <NavButtons options={['Deposit', 'Withdraw']} active={mode} onClick={v => setMode(v)} />
                    <HStack id="too" w='full' justify="center" spacing="0" flexDirection={mode === 'Deposit' ? 'row' : 'row-reverse'}>
                        <VStack w="73px">
                            <Image src={`/assets/networks/ethereum.png`} w="40px" h="40px" />
                            <Text color="mainTextColorLight">Ethereum</Text>
                        </VStack>
                        <VStack w='73px' alignItems="center">
                            <ArrowForwardIcon fontSize="20px" />
                        </VStack>
                        <VStack w="73px">
                            <Image src={`/assets/networks/base.svg`} w="40px" h="40px" />
                            <Text color="mainTextColorLight">Base</Text>
                        </VStack>
                    </HStack>
                    <VStack alignItems="flex-start" w='full'>
                        <TextInfo message="From source chain to destination chain, you will pay gas on the source chain">
                            <Text>Amount to bridge:</Text>
                        </TextInfo>
                    </VStack>
                    <SimpleAmountForm
                        defaultAmount={amount}
                        address={DOLA}
                        destination={mode === 'Deposit' ? BASE_L1_ERC20_BRIDGE : BASE_L2_ERC20_BRIDGE}
                        signer={signer}
                        decimals={18}
                        hideInputIfNoAllowance={false}
                        onAction={({ bnAmount }) => handleAction(bnAmount)}
                        onMaxAction={({ bnAmount }) => handleAction(bnAmount)}
                        actionLabel={'Bridge DOLA (native bridge)'}
                        onAmountChange={(v) => setAmount(v)}
                        showMaxBtn={true}
                        onSuccess={() => handleSuccess()}
                        enableCustomApprove={true}
                        containerProps={{ spacing: '4' }}
                        extraBeforeButton={
                            <VStack alignItems="flex-start" w='full'>
                                <TextInfo message="If you wish to receive the asset on another address than the current connected wallet address">
                                    <Text>Recipient address (optional):</Text>
                                </TextInfo>
                                <Input w='full' placeholder={account} value={to} onChange={e => setTo(e.target.value)} />
                            </VStack>
                        }
                    />
                    {
                        isSuccess && <SuccessMessage
                            title="Bridging to Base started!"
                            description={
                                <VStack>
                                    <Text>
                                        It can take up to 30 minutes for the bridging to complete and the DOLA to arrive on Base.
                                    </Text>
                                    <HStack>
                                        <Text>
                                            Your wallet on Base:
                                        </Text>
                                        <Link isExternal target="_blank" href={`https://basescan.org/address/${account}`}>
                                            Basescan <ExternalLinkIcon />
                                        </Link>
                                    </HStack>
                                </VStack>
                            }
                        />
                    }
                </VStack>
        }
    </Container>
}