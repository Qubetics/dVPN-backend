import cron from "node-cron";
import axios from "axios";
import redisHelper from "../helpers/redis.helper";

class Worker {
  public async startUserWorker(): Promise<void> {
    try {
      cron.schedule("* * * * *", async () => {
        console.log("Cron running...");

        const response = await axios.get(`${process.env.BASE_API_URL}/qubetics/session/v3/sessions`);
        const sessions = response?.data?.sessions || [];

        const redisRaw = (await redisHelper.client.get("node_addresses")) as string;

        if (!redisRaw) {
          console.log("No node_addresses found in Redis.");
          return;
        }

        let nodeAddresses: string[] = [];
        try {
          nodeAddresses = JSON.parse(redisRaw);
          console.log("[DEBUG] nodeAddresses =", nodeAddresses);
        } catch (err) {
          console.log("Invalid JSON stored in Redis (expected array):", err);
          return;
        }

        // Final output: { nodeAddress: [acc1, acc2] }
        const resultMap: Record<string, string[]> = {};

        for (const session of sessions) {
          const nodeAddr = session.base_session.node_address;
          const accAddr = session.base_session.acc_address;

          console.log("[DEBUG] nodeAddr =", nodeAddr);

          if (nodeAddresses.includes(nodeAddr)) {
            if (!resultMap[nodeAddr]) {
              resultMap[nodeAddr] = [];
            }

            if (!resultMap[nodeAddr].includes(accAddr)) {
              resultMap[nodeAddr].push(accAddr);
            }
          }
        }

        console.log("Final Node → User Array Map:", resultMap);
      });
    } catch (error) {
      console.log("Cron Error:", error);
    }
  }
}

export default new Worker();
