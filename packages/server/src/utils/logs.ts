import { open } from "node:fs/promises";

import { DATE_REGEX } from "./regexes";
import { read } from "node:fs";

import { promisify } from "node:util";

const readAsync = promisify(read);

// Max buffer size for the `read` function
const BUF_SIZE = 2 ** 16;

/**
 * An async generator function that efficiently reads log files in descending order.
 * The file is read using node's `read` function, which takes in a pre-defined buffer as input.
 * It allows for us to read the file in reverse by specifying the position in the file we want to begin with.
 * @param fileName The path to the log file in `/var/logs/`
 *
 */
export async function* getLogs(fileName: string) {
	const file = await open(fileName);

	// Retrieving the size of the file in bytes. This will
	// help us determine where we need to start in the file
	// so that we can display the logs in descending order (i.e. the latest logs first)
	const { size } = await file.stat();

	let totalBytesRead = 0;
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
		let logEntries = bufferWithRemainder.split(DATE_REGEX);

		if (logEntries.length % 2 === 1) {
			remainder = logEntries[0];

			logEntries = logEntries.slice(1);
		}

		for (let i = logEntries.length - 1; i >= 0; i -= 2) {
			yield `${logEntries[i - 1]}${logEntries[i]}`;
		}
	}
	await file.close();
}
