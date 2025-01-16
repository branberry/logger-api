import type { FastifyInstance } from "fastify";
import { Readable } from "node:stream";
import { retrieveLogs } from "../utils/logs";

interface LogQueryParams {
	file: string;
	num_entries?: string;
	search?: string;
}
const LOG_PATH_PREFIX = "/var/logs/";

export async function logRoutes(
	fastify: FastifyInstance,
	_options: Record<string, unknown>,
) {
	fastify.get("/logs", async (req, reply) => {
		const {
			file,
			num_entries: numEntries,
			search,
		} = req.query as LogQueryParams;
		const parsedNumEntries = numEntries
			? Number.parseInt(numEntries)
			: undefined;

		if (Number.isNaN(parsedNumEntries)) {
			reply.send({
				status: 400,
				message: `ERROR! Invalid numEntries provided: ${numEntries}`,
			});
		}

		const options = {
			numEntries: parsedNumEntries,
			searchQuery: search,
		};
		const stream = Readable.from(
			retrieveLogs(`${LOG_PATH_PREFIX}${file}`, options),
		);

		return reply.send(stream);
	});
}
