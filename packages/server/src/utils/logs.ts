import { open } from "node:fs/promises";

import { DATE_REGEX_USER_MANAGER_D, DATE_REGEX_STANDARD } from "./regexes";
import { read } from "node:fs";

import { promisify } from "node:util";

const readAsync = promisify(read);

// Max buffer size for the `read` function
const BUF_SIZE = 2 ** 16;

interface RetrieveLogOptions {
	numEntries?: number;
	searchQuery?: string;
}

/**
 * An async generator function that efficiently reads log files in descending order.
 * The file is read using node's `read` function, which takes in a pre-defined buffer as input.
 * It allows for us to read the file in reverse by specifying the position in the file we want to begin with.
 * @param fileName The path to the log file in `/var/logs/`
 *
 */
export async function* retrieveLogs(
	fileName: string,
	{ numEntries, searchQuery }: RetrieveLogOptions = {},
) {
	const file = await open(fileName);

	// Retrieving the size of the file in bytes. This will
	// help us determine where we need to start in the file
	// so that we can display the logs in descending order (i.e. the latest logs first)
	const { size } = await file.stat();

	let totalBytesRead = 0;
	let entriesCount = 0;
	let remainder = "";

	while (totalBytesRead < size) {
		// Doing math.min here because as we get near the end of the file (or, the beginning, in this case)
		// we'll probably have the last buffer be somewhat smaller than the standard chunk size.
		// This is to ensure we don't read duplicate data.
		const bufferSize = Math.min(size - totalBytesRead, BUF_SIZE);

		const buffer = Buffer.alloc(bufferSize);

		// This is where we go backwards. To calculate our current position at each iteration,
		//
		const currPosition = Math.max(0, size - BUF_SIZE - totalBytesRead);

		const { bytesRead } = await readAsync(
			file.fd,
			buffer,
			0,
			bufferSize,
			currPosition,
		);

		totalBytesRead += bytesRead;

		const bufferWithRemainder = `${buffer.toString()}${remainder}`;

		if (remainder) {
			// the remainder will be a part of the oldest record in the current buffer.
			remainder = "";
		}

		// When testing on my mac, there is a log group called usermanagerd which has a different
		// log entry date pattern (2024-12-29 00:39:43.168048Z), so I separated the regexes in case this unique log file is read.
		// The standard regex pattern is (Tue Jan 14 22:04:13 2025)
		let logEntries = bufferWithRemainder.split(
			fileName.includes("usermanagerd")
				? DATE_REGEX_USER_MANAGER_D
				: DATE_REGEX_STANDARD,
		);

		if (logEntries.length % 2 === 1) {
			remainder = logEntries[0];

			logEntries = logEntries.slice(1);
		}

		for (let i = logEntries.length - 1; i >= 0; i -= 2) {
			if (numEntries && entriesCount === numEntries) {
				return;
			}
			const logEntry = `${logEntries[i - 1]}${logEntries[i]}`;

			if (searchQuery && !logEntry.includes(searchQuery)) {
				continue;
			}
			yield logEntry;
			entriesCount += 1;
		}
	}
	await file.close();
}
