import { open } from "node:fs/promises";

export async function getLogs() {
	const testFilePath = "/var/logs/usermanagerd.log.0";

	const fileContentArr = [];
	const file = await open(testFilePath);

	for await (const chunk of file.createReadStream()) {
		const chunkBuf = chunk as Buffer;

		const chunkStr = chunkBuf.toString().split("\n").reverse().join("\n");

		fileContentArr.push(chunkStr);
	}

	return fileContentArr.reverse().join("");
}
