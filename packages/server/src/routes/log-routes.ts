import type { FastifyInstance } from "fastify";
import { getLogs } from "../utils/logs";

export async function logRoutes(
	fastify: FastifyInstance,
	options: Record<string, unknown>,
) {
	fastify.get("/logs", async (_, response) => {
		const logs = await getLogs();

		response.send(logs);
	});
}
