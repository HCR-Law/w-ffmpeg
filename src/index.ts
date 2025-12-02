import cluster from "node:cluster";
import os from "node:os";
import process from "node:process";

const CLUSTER_LIM = 1;
const clampedParrallelism = Math.min(CLUSTER_LIM, os.availableParallelism());

if (cluster.isPrimary) {
    for (let i = 0; i < clampedParrallelism; i++) {
        cluster.fork();
    }
} else {
    await import("./server");
    console.log(`Worker ${process.pid} started`);
}