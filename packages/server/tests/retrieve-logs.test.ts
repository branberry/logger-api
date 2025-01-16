import { expect, test } from "vitest";
import { retrieveLogs } from "../src/utils/logs";

test("usermanagerd.log is parsed as expected in descending order", async () => {
	const logs = [];
	for await (const logGroup of retrieveLogs("./tests/data/usermanagerd.log")) {
		logs.push(logGroup);
	}

	expect(logs.join("")).toMatchSnapshot();
});

test("usermanagerd.log is parsed and the first 5 log entries are returned", async () => {
	const logs = [];
	for await (const logGroup of retrieveLogs("./tests/data/usermanagerd.log", {
		numEntries: 5,
	})) {
		logs.push(logGroup);
	}

	expect(logs.join("")).toMatchSnapshot();
});

test("usermanagerd.log is parsed and log entries relevant to the search 'com.apple.searchd.personaobserver' are returned", async () => {
	const logs = [];
	for await (const logGroup of retrieveLogs("./tests/data/usermanagerd.log", {
		searchQuery: "com.apple.searchd.personaobserver",
	})) {
		logs.push(logGroup);
	}

	expect(logs.join("")).toMatchSnapshot();
});

test("usermanagerd.log is parsed and the first entry that matches the search 'com.apple.searchd.personaobserver' is returned", async () => {
	const logs = [];
	for await (const logGroup of retrieveLogs("./tests/data/usermanagerd.log", {
		numEntries: 1,
	})) {
		logs.push(logGroup);
	}

	expect(logs.join("")).toMatchSnapshot();
});
