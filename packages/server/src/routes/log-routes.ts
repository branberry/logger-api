import type { FastifyInstance } from "fastify";
import { getLogs } from "../utils/logs";

interface LogQueryParams {
	file: string;
}

export async function logRoutes(
	fastify: FastifyInstance,
	_options: Record<string, unknown>,
) {
	fastify.get("/logs", async (req, resp) => {
		const { file } = req.query as LogQueryParams;
		const logs = await getLogs(file);

		resp.send(logs);
	});
}
