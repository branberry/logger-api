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
 * @param fileName The path to the log file in `/var/logs/
 *
 */
export async function* getLogs(fileName: string) {
	const file = await open(fileName);
	const { size } = await file.stat();

	let totalBytesRead = 0;
	let remainder = "";
	while (totalBytesRead < size) {
		const buffer = Buffer.alloc(Math.min(size - totalBytesRead, BUF_SIZE));

		const { bytesRead } = await readAsync(
			file.fd,
			buffer,
			0,
			Math.min(size - totalBytesRead, BUF_SIZE),
			Math.max(0, size - BUF_SIZE - totalBytesRead),
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
			console.log(`${logEntries[i - 1]}${logEntries[i]}`);
			yield `${logEntries[i - 1]}${logEntries[i]}`;
		}
		// yield buffer.toString().split(DATE_REGEX).reverse().join("");
	}
	console.log(totalBytesRead, size);
	await file.close();
}
