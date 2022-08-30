import { VStack, HStack, useDisclosure } from '@chakra-ui/react'

import { useAccountDBR } from '@app/hooks/useDBR'
import { preciseCommify } from '@app/util/misc';
import { F2StateInfo } from './F2StateInfo';
import { QuantityBar } from './QuantityBar';
import { F2DbrInfosModal } from '../Modals/F2DbrInfosModal';
import { getRiskColor } from '@app/util/f2';

export const DbrHealth = ({
  account,
  debtDelta = 0,
}: {
  account: string | undefined | null
  debtDelta: number
}) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { dbrNbDaysExpiry, signedBalance, dailyDebtAccrual, dbrDepletionPerc, dbrExpiryDate, balance, debt } = useAccountDBR(account);
  const { dailyDebtAccrual: newDailyRate, dbrExpiryDate: previewExpiryDate, dbrDepletionPerc: previewPerc, dbrNbDaysExpiry: previewNbDays } = useAccountDBR(account, debt + debtDelta);

  const hasDebt = dailyDebtAccrual !== 0;

  const isPreviewing = !!debtDelta;
  const riskColor = newDailyRate > 0 ? getRiskColor(previewPerc) : 'secondaryTextColor';
  const needsRechargeSoon = previewNbDays <= 30 && hasDebt;

  return (
    <VStack w='full' spacing="0" alignItems="center">
      <F2DbrInfosModal onClose={onClose} isOpen={isOpen} />
      <HStack w='full' justifyContent="space-between">
        <F2StateInfo
          currentValue={dbrExpiryDate}
          nextValue={isPreviewing ? previewExpiryDate : undefined}
          type={'date'}
          placeholder={hasDebt && dbrNbDaysExpiry <= 0 ? 'Exhausted!' : 'No on-going Loans'}
          prefix={(hasDebt && !isPreviewing) || (isPreviewing && !dbrExpiryDate) ? 'Fixed Rate until ' : undefined}
          nullPlaceholder="no more loan"
          tooltipTitle={hasDebt || isPreviewing ? "Fixed Rate until" : ''}
          color={riskColor}
          tooltip={
            hasDebt || isPreviewing ? "Date where you will be in deficit of DBR tokens (Exhaustion state), someone can then do a force recharge of your DBR, which will cause your debt to increase and damage the Collateral Health."
              : ''
          }
        />
        <F2StateInfo
          currentValue={-dailyDebtAccrual}
          nextValue={isPreviewing ? -newDailyRate : undefined}
          placeholder={balance ? `${preciseCommify(balance, 2)} DOLA / Year` : ''}
          suffix=" DBR a day"
          prefix="Fixed Rate: "
          type="number"
          color={riskColor}
          tooltip="If you have loans your DBR balance will decrease over time by an amount that depends on your debt."
        />
      </HStack>
      <QuantityBar
        title={needsRechargeSoon ? 'Please Recharge DBR' : 'Fixed Rate Validity'}
        perc={dbrDepletionPerc}
        previewPerc={previewPerc}
        badgeColorScheme={'success'}
        isPreviewing={isPreviewing}
        cursor="pointer"
        hasError={needsRechargeSoon}
        onClick={() => onOpen()}
      />
      <HStack pt="4" w='full' justifyContent="space-between">
        {/* <Text color="secondaryTextColor">
          {
            dbrNbDaysExpiry > 0 ?
              `${moment(dbrExpiryDate).fromNow(true)} before Exhaust`
              :
              hasDebt ?
                'Exhausted! Collateral Health may get damaged'
                :
                signedBalance === 0 ?
                  'Get DBR tokens to hold loans over time'
                  :
                  'No on-going Loans'
          }
        </Text> */}
        <F2StateInfo
          currentValue={dbrExpiryDate}
          nextValue={isPreviewing ? previewExpiryDate : undefined}
          type={'remainingTime'}
          placeholder={hasDebt && dbrNbDaysExpiry <= 0 ? 'Exhausted!' : 'Borrow to start'}
          suffix={(isPreviewing && previewExpiryDate !== null) || (!isPreviewing && hasDebt) ? ' before Fixed Rate Exhaustion' : undefined}
          nullPlaceholder="no more loan"
          tooltipTitle="Time before Exhaustion"
          tooltip={
            hasDebt ? "Remaining time before you become in deficit of DBR tokens (Exhaustion state), a state  where someone can do a force recharge of your DBR, which will cause your debt to increase and damage the Collateral Health."
              : ''
          }
        />
        <F2StateInfo
          currentValue={signedBalance}
          placeholder={'No DBR tokens'}
          prefix="DBR tokens: "
          tooltip="DBR stands for DOLA Borrowing Rights, it allows borrowers to lock-in a fixed borrow rate. If you have loans your DBR balance will decrease over time by an amount that depends on your debt."
        />
        {/* <Text color="secondaryTextColor">
          {
            signedBalance === 0 && !hasDebt ?
              'No DBR tokens'
              :
              `DBR tokens: ${preciseCommify(signedBalance, 2)}`
          }
        </Text> */}
      </HStack>
    </VStack>
  )
}
