import type { FastifyInstance } from "fastify";
import { getLogs } from "../utils/logs";

interface LogQueryParams {
	file: string;
	num_entries: string;
}

export async function logRoutes(
	fastify: FastifyInstance,
	_options: Record<string, unknown>,
) {
	fastify.get("/logs", async (req, resp) => {
		const { file, num_entries: numEntries } = req.query as LogQueryParams;
		const logs = await getLogs(
			file,
			numEntries ? Number.parseInt(numEntries) : undefined,
		);

		resp.send(logs);
	});
}
