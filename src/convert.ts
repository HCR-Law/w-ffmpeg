// convert.ts
import { status } from "elysia";

export async function convert(
    inputType: string,
    outputType: string,
    file: Blob,
) {
    const audioCodec = "pcm_s16le"; // will replace with switch cases later

    const inPath = `./tmp/ffmpeg-in-${Date.now()}-${crypto.randomUUID()}.${inputType}`;
    await Bun.write(inPath, file);

    const outPath = `./tmp/ffmpeg-out-${Date.now()}-${crypto.randomUUID()}.${outputType}`;

    const cmd: string[] = [
        "ffmpeg",
        "-y", // overwrite output if it exists
        "-i", inPath, // input file path
        "-vn", // ignore video
        "-c:a", audioCodec, // audio codec
        outPath, // output file path
    ];

    console.log("cmd:", cmd.join(" "));

    const subProcess = Bun.spawn(cmd, {
        stdout: "ignore",
        stderr: "pipe",
    });

    const exitCode = await subProcess.exited;
    const err = await subProcess.stderr.text();

    if (exitCode !== 0) {
        console.error(err);
        return status(500, "FFMPEG internal error");
    }

    const outBunFile = Bun.file(outPath);
    const outBytes = await outBunFile.arrayBuffer();
    const outBlob = new Blob([outBytes], { type: `audio/${outputType}` });

    // 3. (Optional) clean up temp files
    await Bun.file(inPath).delete();
    await outBunFile.delete();

    return outBlob;
}
