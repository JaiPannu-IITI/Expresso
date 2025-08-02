import * as faceapi from "@vladmandic/face-api";

export const loadModels = async () => {
  const MODEL_URL = `/models`;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.load(MODEL_URL),
    faceapi.nets.faceExpressionNet.load(MODEL_URL),
  ]);
};

export const predictEmotion = async (videoElement: HTMLVideoElement) => {
  if (videoElement) {
    const detectionsWithExpression = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();
    const predicted_emotion =
      detectionsWithExpression?.expressions.asSortedArray()[0].expression;
    if (
      predicted_emotion &&
      predicted_emotion !== "neutral" &&
      predicted_emotion !== undefined
    ) {
      return predicted_emotion;
    }
  }
};
