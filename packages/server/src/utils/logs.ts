import { open } from "node:fs/promises";
import { DATE_REGEX } from "./regexes";

export async function getLogs() {
	const testFilePath = "/var/logs/usermanagerd.log.0";

	const fileContentArr = [];
	const file = await open(testFilePath);

	for await (const chunk of file.createReadStream()) {
		const chunkBuf = chunk as Buffer;

		const chunkStr = chunkBuf.toString().split(DATE_REGEX).reverse().join("");

		fileContentArr.push(chunkStr);
	}

	return fileContentArr.reverse().join("");
}
