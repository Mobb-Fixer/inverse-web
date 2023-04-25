import { Stack, useMediaQuery } from "@chakra-ui/react";
import { AreaChart, AreaChartProps } from "./AreaChart"
import { useEffect, useState } from "react";
import { BarChart12Months, BarChart12MonthsProps } from "./BarChart12Months";
import { useAppTheme } from "@app/hooks/useAppTheme";
import { CoordinatesArray } from "@app/types";

export const DefaultCharts = ({
    chartData,
    maxChartWidth = 800,
    areaProps,
    barProps,
    isDollars,
    isPerc,
    showAreaChart = true,
    showMonthlyBarChart = false,
}: {
    chartData: CoordinatesArray,
    maxChartWidth?: number,
    areaProps?: AreaChartProps,
    barProps?: BarChart12MonthsProps,
    isDollars?: boolean
    isPerc?: boolean
    showAreaChart?: boolean
    showMonthlyBarChart?: boolean
}) => {
    const [chartWidth, setChartWidth] = useState<number>(maxChartWidth);
    const [isLargerThan] = useMediaQuery(`(min-width: ${maxChartWidth}px)`);
    const { themeStyles } = useAppTheme();
    const defaultColorScale = [themeStyles.colors.secondary];

    useEffect(() => {
        setChartWidth(isLargerThan ? maxChartWidth : (screen.availWidth || screen.width) - 40)
    }, [isLargerThan]);

    return <Stack w='full' direction={{ base: 'column' }}>
        {
            showAreaChart && <AreaChart
                showTooltips={true}
                height={300}
                width={chartWidth}
                data={chartData}
                domainYpadding={'auto'}
                mainColor="secondary"
                isDollars={isDollars}
                isPerc={isPerc}
                {...areaProps}
            />
        }
        {
            showMonthlyBarChart && <BarChart12Months
                chartData={chartData}
                maxChartWidth={chartWidth}
                colorScale={defaultColorScale}
                isDollars={isDollars}
                eventName="Value"
                yAttribute="yDay"
                {...barProps}
            />
        }
    </Stack>
}