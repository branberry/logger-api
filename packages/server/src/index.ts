import Fastify from "fastify";
import { logRoutes } from "./routes/log-routes";

const fastify = Fastify({
	logger: true,
});

fastify.register(logRoutes);

fastify.get("/", (_, reply) => {
	reply.send({ hello: "world" });
});

fastify.listen({ port: 3000 }, (err, address) => {
	if (err) {
		fastify.log.error(err);
		process.exit(1);
	}
	console.log(`Server is now listening on ${address}`);
});
