# Logger REST API

This is a log aggregation and querying REST API written using TypeScript, Node.js, and Fastify. The project's dependencies are managed using [`pnpm`](https://pnpm.io/installation). 

## Installation and Setup
To get started, you'll want Node.js 18 or later. If you're using [`nvm`](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating), you can run `nvm use` at the root directory of this project to use the version of node that this project was created with. 

To install the dependencies for the project, simply run `pnpm install` at the root of this project.

This project uses [`PNPM Workspaces`](https://pnpm.io/workspaces) for extensibility i.e. if additional components are added (such as a UI), they can be installed with a single `pnpm install` command.

## Running and querying the server

 To start the server, you can run `pnpm start:server`. Once running, the log API can be accessed locally from `localhost:3000/logs` using a GET request. 

Here's an example query using `cURL`:

```sh
curl  -X GET \
  'localhost:3000/logs?file=usermanagerd.log.0&num_entries=9&search=hello'
```

The API has the following query parameters:

```
	 * file: string (required) The name of the log file in '/var/logs/'.
	 * num_entries: integer (optional) The number of log entries necessary to be returned.
	 * search: string (optional) A string to search log elements by. log entries that contain the search string are returned.
```

The logs are returned in descending order (newest logs appear first).

## Running unit tests

To run unit tests, run `pnpm test:server`. This will start the unit tests with `vitest`.

## file structure
```
📦packages
 ┗ 📂server
 ┃ ┣ 📂src
 ┃ ┃ ┣ 📂routes
 ┃ ┃ ┃ ┗ 📜log-routes.ts
 ┃ ┃ ┣ 📂utils
 ┃ ┃ ┃ ┣ 📜logs.ts
 ┃ ┃ ┃ ┗ 📜regexes.ts
 ┃ ┃ ┗ 📜index.ts
 ┃ ┣ 📂tests
 ┃ ┃ ┣ 📂__snapshots__
 ┃ ┃ ┃ ┗ 📜retrieve-logs.test.ts.snap
 ┃ ┃ ┣ 📂data
 ┃ ┃ ┃ ┗ 📜usermanagerd.log
 ┃ ┃ ┗ 📜retrieve-logs.test.ts
 ┃ ┣ 📜package.json
 ┃ ┗ 📜tsconfig.json
```

The API endpoint is defined in the `packages/server/src/routes/log-routes.ts` file. This handles validating the GET request, and sending the response back as a stream. This allows for effectively sending large files (>1G) via HTTP. 

The actual logic to read the log file lives in `packages/server/src/utils/logs.ts`. This file contains a function called `retrieveLogs`, which is an async generator function that efficiently reads large log files.