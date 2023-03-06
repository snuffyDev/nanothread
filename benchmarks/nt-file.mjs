import b from "benchmark";
import { ThreadPool } from "../dist/index.mjs";
import { parentPort } from "worker_threads";
import { fileURLToPath } from "url";

const nt = new ThreadPool({
	task: fileURLToPath(new URL("./workers/fasta.nt.mjs", import.meta.url)),
	count: 4,
	maxConcurrency: 3,
});
const NUM = 250000;

parentPort?.on("message", () => {
	new b.Suite()
		.add(
			"nanothreads ([file] threadpool)",
			async () => {
				return await nt.exec(NUM);
				// return await doThings(NUM);
			},
			{ async: true },
		)
		.on("cycle", function (event) {
			parentPort?.postMessage(String(event.target));
		})
		.run({
			async: true,
			teardown: async () => {
				return await nt.terminate();
			},
		});
});
