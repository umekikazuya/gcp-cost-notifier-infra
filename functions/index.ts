import { BigQuery } from "@google-cloud/bigquery";

// 環境変数
const datasetId = process.env.DATASET_ID!;
const webhookUrl = process.env.DISCORD_WEBHOOK_URL!;

// メイン関数
export const main = async (req: any, res: any) => {
  try {
    const bigquery = new BigQuery();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const ymd = yesterday.toISOString().split("T")[0];

    const query = `
      SELECT
        project.name AS project,
        ROUND(SUM(cost), 2) AS cost
      FROM \`${bigquery.projectId}.${datasetId}.gcp_billing_export_v1_*\`
      WHERE
        _PARTITIONTIME BETWEEN TIMESTAMP("${ymd}") AND TIMESTAMP("${ymd} 23:59:59")
      GROUP BY project
      ORDER BY cost DESC
    `;

    let content = "";
    try {
      const [job] = await bigquery.createQueryJob({ query });
      const [rows] = await job.getQueryResults();
      const total = rows.reduce((sum, row) => sum + Number(row.cost), 0);
      const costList = rows
        .map((r: any) => `・${r.project}: ¥${Number(r.cost).toLocaleString()}`)
        .join("\n");

      content = `**[Costor] ${ymd} のGCP料金レポート**\n合計: ¥${total.toLocaleString()}\n${costList}`;
    } catch (error) {
      content = `課金データのテーブルがまだ作成されていません。`;
    }

    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    res.status(200).send("Notification sent.");
  } catch (err) {
    console.error("Error:", err);
    res.status(500).send("Failed to send notification.");
  }
};
