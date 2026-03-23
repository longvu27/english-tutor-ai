export function createRecorder() {
  let mediaRecorder = null;
  let chunks = [];

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    mediaRecorder = new MediaRecorder(stream);

    chunks = [];

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunks.push(e.data);
      }
    };

    mediaRecorder.start();
  };

  const stop = () => {
    if (!mediaRecorder) {
      throw new Error("Recorder chưa start");
    }

    return new Promise((resolve) => {
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        resolve(blob);
      };

      mediaRecorder.stop();
    });
  };

  return { start, stop };
}