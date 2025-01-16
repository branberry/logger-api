import Fastify from "fastify";
import { logRoutes } from "./routes/log-routes";
import { DATE_REGEX } from "./utils/regexes";

const fastify = Fastify({
	logger: true,
});

fastify.register(logRoutes);

fastify.get("/", (_, reply) => {
	reply.send({ hello: "world" });
});

fastify.listen({ port: 3000 }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log(`Server is now listening on ${address}`);
});

const testString = `ver: fetchPersona entitlement failure:88737
2024-12-28 15:19:02.050319Z [82286] (0x16b86f000) In UMSyncServer: fetchPersona entitlement failure:89072
2024-12-28 15:23:45.232597Z [82286] (0x16b8fb000) In UMSyncServer: fetchPersona entitlement failure:89129
2024-12-28 15:29:39.877980Z [82286] (0x16b8fb000) In UMSyncServer: fetchPersona entitlement failure:89291
2024-12-28 17:33:43.139496Z [82286] (0x16b8fb000) In UMSyncServer: fetchPersona entitlement failure:92741
2024-12-28 18:55:11.349288Z [94385] (0x203f80240) Loaded Persona Generation ID from manifest:1
2024-12-28 18:55:11.359552Z [94385] (0x203f80240) Adding 0 entry to persona Table for user:FFFFEEEE-DDDD-CCCC-BBBB-AAAA000000F8
2024-12-28 18:55:11.359657Z [94385] (0x203f80240) Adding 199 entry to persona Table for user:FFFFEEEE-DDDD-CCCC-BBBB-AAAA000000F8
2024-12-28 18:55:11.359693Z [94385] (0x203f80240) Adding 99 entry to persona Table for user:FFFFEEEE-DDDD-CCCC-BBBB-AAAA000000F8
2024-12-28 18:55:11.359732Z [94385] (0x203f80240) Adding 1000 entry to persona Table for user:FFFFEEEE-DDDD-CCCC-BBBB-AAAA000000F8
2024-12-28 18:55:11.359781Z [94385] (0x203f80240) Adding 1001 entry to persona Table for user:7A6F7608-148A-4216-82C0-6B055EB52044`;

const testArr = testString.split(DATE_REGEX);

if (testArr.length % 2 === 1) {
	const remainder = testArr[0];
	// this is the logic to capture remainders
	const validEntries = testArr.slice(1);
	const result = [];
	for (let i = 0; i < validEntries.length - 1; i += 2) {
		result.push(`${validEntries[i]}${validEntries[i + 1]}`);
	}
	console.log(result.reverse().join(""));
}
