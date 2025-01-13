import { open } from "node:fs/promises";
import { createInterface } from "node:readline";
import { DATE_REGEX } from "./regexes";
import { createReadStream } from "node:fs";

async function streamLogfile(fileName: string) {
	return new Promise((resolve, reject) => {
		const fileData: string[] = [];
		const fileStream = createReadStream(`/var/logs/${fileName}`);

		const fileReader = createInterface({
			input: fileStream,
			output: process.stdout,
			terminal: false,
		});

		fileReader.on("line", (data) => {
			console.log(data);
			fileData.unshift(data);
		});
		fileReader.on("error", (error) =>
			reject(`An error occurred when reading the file: ${error}`),
		);
		fileReader.on("close", () => {
			resolve(fileData);
		});
	});
}
export async function getLogs(fileName: string) {
	const file = await open(`/var/logs/${fileName}`);

	const fileContentArr = [];

	streamLogfile(fileName);

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
