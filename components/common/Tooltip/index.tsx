import { Tooltip, IconProps } from '@chakra-ui/react'
import { InfoOutlineIcon } from '@chakra-ui/icons'

export const InfoTooltip = ({ message, iconProps, ...props }: { message: string, iconProps?: IconProps}) => {
  return (
    <Tooltip
      label={message}
      fontWeight="medium"
      fontSize="15px"
      p={3}
      borderRadius={8}
      bgColor="purple.800"
      borderColor="purple.850"
      textAlign="center"
      borderWidth={1}
      {...props}
    >
      <InfoOutlineIcon {...iconProps} />
    </Tooltip>
  )
}
