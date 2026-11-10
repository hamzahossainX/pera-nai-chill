export interface FaceBoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

class FaceService {
  private detector: unknown = null;
  private isInitializing = false;
  private initFailed = false;

  public async getDetector(): Promise<unknown> {
    if (this.detector) return this.detector;
    if (this.initFailed) return null;
    if (this.isInitializing) {
      // Wait briefly if already initializing
      let attempts = 0;
      while (this.isInitializing && attempts < 20) {
        await new Promise((r) => setTimeout(r, 100));
        attempts++;
      }
      return this.detector;
    }

    this.isInitializing = true;
    try {
      const { FilesetResolver, FaceDetector } = await import(
        "@mediapipe/tasks-vision"
      );
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      try {
        this.detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU",
          },
          runningMode: "IMAGE",
        });
      } catch (gpuErr) {
        console.warn("GPU delegate for MediaPipe failed, falling back to CPU:", gpuErr);
        this.detector = await FaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "CPU",
          },
          runningMode: "IMAGE",
        });
      }
      return this.detector;
    } catch (err) {
      console.warn("MediaPipe FaceDetector failed to initialize, manual crop available:", err);
      this.initFailed = true;
      return null;
    } finally {
      this.isInitializing = false;
    }
  }

  public async detectFaceBox(
    image: HTMLImageElement | HTMLCanvasElement
  ): Promise<FaceBoundingBox | null> {
    try {
      const detector = (await this.getDetector()) as {
        detect: (img: HTMLImageElement | HTMLCanvasElement) => {
          detections: Array<{
            boundingBox?: {
              originX: number;
              originY: number;
              width: number;
              height: number;
            };
          }>;
        };
      } | null;

      if (!detector) return null;

      const results = detector.detect(image);
      if (!results.detections || results.detections.length === 0) {
        return null;
      }

      const raw = results.detections[0].boundingBox;
      if (!raw) return null;

      const imgWidth = "naturalWidth" in image ? image.naturalWidth : image.width;
      const imgHeight = "naturalHeight" in image ? image.naturalHeight : image.height;

      // Expand bounding box by 40%
      const expansionFactor = 0.4;
      const expandW = raw.width * expansionFactor;
      const expandH = raw.height * expansionFactor;

      const newX = Math.max(0, raw.originX - expandW / 2);
      const newY = Math.max(0, raw.originY - expandH / 2);
      const newW = Math.min(imgWidth - newX, raw.width + expandW);
      const newH = Math.min(imgHeight - newY, raw.height + expandH);

      // Make it square
      const size = Math.max(newW, newH);
      const centerX = newX + newW / 2;
      const centerY = newY + newH / 2;

      const squareX = Math.max(0, Math.min(imgWidth - size, centerX - size / 2));
      const squareY = Math.max(0, Math.min(imgHeight - size, centerY - size / 2));
      const finalSize = Math.min(size, imgWidth - squareX, imgHeight - squareY);

      return {
        x: Math.max(0, squareX),
        y: Math.max(0, squareY),
        width: Math.max(10, finalSize),
        height: Math.max(10, finalSize),
      };
    } catch (err) {
      console.warn("Face detection error:", err);
      return null;
    }
  }

  public cartoonifyFace(
    source: CanvasImageSource,
    crop: { x: number; y: number; width: number; height: number }
  ): string {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const center = 128;
    const radius = 120;

    // Circular Clip
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // Comic Contrast & Saturation Boost
    ctx.filter = "contrast(1.22) saturate(1.25) brightness(1.05)";

    ctx.drawImage(
      source,
      crop.x,
      crop.y,
      crop.width,
      crop.height,
      0,
      0,
      256,
      256
    );
    ctx.restore();

    // Thick Comic Black Outline
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // Subtle inner golden border ring for rickshaw-art flair
    ctx.beginPath();
    ctx.arc(center, center, radius - 6, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(245, 158, 11, 0.7)";
    ctx.stroke();

    return canvas.toDataURL("image/png");
  }

  public generateDefaultFunnyFace(): string {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const center = 128;

    // Background circle (skin tone)
    ctx.beginPath();
    ctx.arc(center, center, 120, 0, Math.PI * 2);
    ctx.fillStyle = "#fbcfe8"; // Cartoon face base
    ctx.fill();
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // Cheek blush
    ctx.fillStyle = "rgba(244, 63, 94, 0.4)";
    ctx.beginPath();
    ctx.arc(75, 145, 18, 0, Math.PI * 2);
    ctx.arc(181, 145, 18, 0, Math.PI * 2);
    ctx.fill();

    // Cartoon Shifty Eyes
    // Left eye white
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.ellipse(85, 110, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // Right eye white
    ctx.beginPath();
    ctx.ellipse(171, 110, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupils looking sideways (shifty / guilty expression)
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(95, 110, 9, 0, Math.PI * 2);
    ctx.arc(181, 110, 9, 0, Math.PI * 2);
    ctx.fill();

    // Sweating drop on forehead (guilty politician)
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(195, 65, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();

    // Big dramatic mustache
    ctx.fillStyle = "#1e293b";
    ctx.beginPath();
    ctx.moveTo(128, 145);
    ctx.quadraticCurveTo(80, 130, 50, 160);
    ctx.quadraticCurveTo(90, 165, 128, 150);
    ctx.quadraticCurveTo(166, 165, 206, 160);
    ctx.quadraticCurveTo(176, 130, 128, 145);
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // Wide guilty smirk
    ctx.beginPath();
    ctx.arc(128, 165, 28, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.lineWidth = 5;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    // Single gold tooth
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(122, 172, 10, 10);
    ctx.strokeRect(122, 172, 10, 10);

    // Thick outer rim
    ctx.beginPath();
    ctx.arc(center, center, 120, 0, Math.PI * 2);
    ctx.lineWidth = 10;
    ctx.strokeStyle = "#000000";
    ctx.stroke();

    return canvas.toDataURL("image/png");
  }
}

export const faceService = new FaceService();
