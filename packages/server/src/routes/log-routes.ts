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
	/**
	 * The main endpoint to retrieve logfiles from /var/logs/.
	 * The endpoint accepts a GET request and returns the logs as a string.
	 * It takes the following options:
	 * file: string (required) The name of the log file in '/var/logs/'.
	 * num_entries: integer (optional) The number of log entries necessary to be returned.
	 * search: string (optional) A string to search log elements by. log entries that contain the search string are returned.
	 */
	fastify.get("/logs", (req, reply) => {
		const {
			file,
			num_entries: numEntries,
			search,
		} = req.query as LogQueryParams;
		const parsedNumEntries = numEntries
			? Number.parseInt(numEntries)
			: undefined;

		if (!file) {
			reply.send({
				status: 400,
				message: `ERROR! Invalid file name provide: ${file}`,
			});
		}

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
