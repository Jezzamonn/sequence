import { parentPort } from "worker_threads";

parentPort?.on("message", (message: any) => {
  console.log(`Worker received message: ${message}`);
  parentPort?.postMessage("Hello from worker");
});
