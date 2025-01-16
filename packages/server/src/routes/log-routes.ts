import type { FastifyInstance } from "fastify";
import { Readable } from "node:stream";
import { getLogs } from "../utils/logs";

interface LogQueryParams {
	file: string;
	num_entries: string;
}
const LOG_PATH_PREFIX = "/var/logs/";

export async function logRoutes(
	fastify: FastifyInstance,
	_options: Record<string, unknown>,
) {
	fastify.get("/logs", async (req, reply) => {
		const { file, num_entries: _numEntries } = req.query as LogQueryParams;
		const stream = Readable.from(getLogs(`${LOG_PATH_PREFIX}${file}`));

		return reply.send(stream);
	});
}
