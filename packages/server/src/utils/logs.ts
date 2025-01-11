import { open } from "node:fs/promises";
import { DATE_REGEX } from "./regexes";

export async function getLogs(fileName: string) {
	const file = await open(`/var/logs/${fileName}`);

	const fileContentArr = [];

	// Read file line by line to save on memory.
	// Instead of reading the whole file, then splitting that into another
	// array, we can look at each chunk and reverse each chunk by the
	//
	for await (const chunk of file.createReadStream()) {
		const chunkBuf = chunk as Buffer;

		const chunkStr = chunkBuf.toString().split(DATE_REGEX).reverse().join("");

		fileContentArr.push(chunkStr);
	}

	return fileContentArr.reverse().join("");
}
