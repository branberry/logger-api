import { expect, test } from "vitest";
import { retrieveLogs } from "../src/utils/logs";

test("usermanagerd.log is parsed as expected in descending order", async () => {
	const logs = [];
	for await (const logGroup of retrieveLogs("./tests/data/usermanagerd.log")) {
		logs.push(logGroup);
	}

	expect(logs.join("")).toMatchSnapshot();
});

test("usermanagerd.log is parsed and log entries relevant to the search are returned", async () => {
	const logs = [];
	for await (const logGroup of retrieveLogs("./tests/data/usermanagerd.log")) {
		logs.push(logGroup);
	}

	expect(logs.join("")).toMatchSnapshot();
});
