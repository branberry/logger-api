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
		// We subtract the max buffer size and the total bytes read from the size of the file.
		// For a contrived example to make this concrete: Say we have a file size of 11 bytes and a
		// buffer size of 2. At the first iteration, the currPosition would be Math.max(0, 11 - 2 - 0) = 9
		// For the second iteration, we'd have Math.max(0, 11 - 2 - 2) = 7 (the last 2 would be the number of bytes
		// read previously). This would go until we reach the last interation. At that point, we'd have read 10 bytes
		// total, and so we'd arrive at Math.max(0, 11 - 2 - 10) = Math.max(0, -1) = 0. This would mean we would
		// start at 0 instead of -1 (which would throw an error, which is never great), and the bufferSize would be 1.
		// That way, we correctly read only the last part of the file that we have yet to read.
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
			// Since we used the remainder previously, we clear it so that we don't
			// accidentally append data where it shouldn't be.
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

		// The logEntries array are split by the date, meaning we should have an even number of date-log pairs.
		// We know we have a remainder (i.e. we only have part of a log entry) if there's an odd number when we
		// perform the split. Since we are going backwards, the remainder would be the first entry, as we read everything
		// AFTER the start position.
		if (logEntries.length % 2 === 1) {
			remainder = logEntries[0];

			// Removing the remainder gurantees that we have an evenly sized log entry array
			logEntries = logEntries.slice(1);
		}

		for (let i = logEntries.length - 1; i >= 0; i -= 2) {
			if (numEntries && entriesCount === numEntries) {
				return;
			}
			// As previously mentioned, the log entries are split by date.
			// The element at index i should be a the log entry, and and i - 1 contains the
			// date for the log entry.
			const logEntry = `${logEntries[i - 1]}${logEntries[i]}`;

			// If there's a search query, we can continue if there's not a match. That way,
			// we don't yield the current log entry value, effectively filtering out entries
			// that don't match the search query.
			if (searchQuery && !logEntry.includes(searchQuery)) {
				continue;
			}

			yield logEntry;
			entriesCount += 1;
		}
	}
	await file.close();
}
