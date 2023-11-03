import { getCacheFromRedis, redisSetWithTimestamp } from "@app/util/redis";
import { repaymentsCacheKey } from "../transparency/repayments";
import { timestampToUTC, uniqueBy } from "@app/util/misc";

export default async (req, res) => {
    const cacheDuration = 3600;
    const cacheKey = 'csv-dola-bad-debt-evolution-v1.0.0';
    res.setHeader('Cache-Control', `public, max-age=${cacheDuration}`);

    try {
        const repaymentsData = (await getCacheFromRedis(repaymentsCacheKey, false)) || { dolaBadDebtEvolution: [] };        
        
        let csvData = `Date,DOLA bad debt\n`;
        const evolutionWithUtcDate = repaymentsData.dolaBadDebtEvolution.map((d) => ({ ...d, utcDate: timestampToUTC(d.timestamp) }));
        const oneDayBeforeExploitDate = '2022-04-01';
        const dailyBadDebtData = uniqueBy(evolutionWithUtcDate, (o1, o2) => o1.utcDate === o2.utcDate)
            .filter(d => d.utcDate >= oneDayBeforeExploitDate);

        dailyBadDebtData.forEach((d) => {
            csvData += `${d.utcDate},${d.badDebt}\n`;
        });

        redisSetWithTimestamp(cacheKey, { csvData });

        // Set response headers to indicate that you're serving a CSV file
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=dola-bad-debt-evolution.csv");

        // Send the CSV data as the response
        res.status(200).send(csvData);
    } catch (e) {
        console.log(e);
        const validCache = await getCacheFromRedis(cacheKey, false);
        const csvData = validCache?.csvData || `\n`;
        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=dola-bad-debt-evolution.csv");
        // Send the CSV data as the response
        res.status(200).send(csvData);
    }
};
