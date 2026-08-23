import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { validateImage } from "./lib/imageInput";

type Props = {
  onTextRecognized: (text: string) => void;
};

export default function ImageOcrInput({ onTextRecognized }: Props) {
  const chooseInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function selectFile(nextFile?: File) {
    if (!nextFile) return;
    const validationError = validateImage(nextFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    setFile(nextFile);
  }

  function handleFileInput(event: ChangeEvent<HTMLInputElement>) {
    selectFile(event.target.files?.[0]);
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    selectFile(event.dataTransfer.files[0]);
  }

  function removeImage() {
    setFile(null);
    setError("");
  }

  async function handleReadImage() {
    if (!file || isReading) return;
    setIsReading(true);
    setError("");
    try {
      const { recognizeImage } = await import("./lib/ocr");
      const text = await recognizeImage(file);
      if (!text) {
        setError("No text was detected in this image.");
        return;
      }
      onTextRecognized(text);
    } catch {
      setError("This image could not be read. Try a clearer image.");
    } finally {
      setIsReading(false);
    }
  }

  return (
    <section className="ocr-input" aria-label="Image text input">
      <div className="ocr-heading">
        <div>
          <span className="ocr-label">Or upload image</span>
        </div>
        <div className="ocr-actions">
          <button type="button" onClick={() => chooseInput.current?.click()}>Choose image</button>
          <button type="button" onClick={() => cameraInput.current?.click()}>Take photo</button>
        </div>
      </div>

      <input ref={chooseInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileInput} />
      <input ref={cameraInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" capture="environment" onChange={handleFileInput} />

      {!file ? (
        <div
          className={`ocr-dropzone ${isDragging ? "dragging" : ""}`}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          Drop one JPG, PNG, or WEBP image here · max 3MB
        </div>
      ) : (
        <div className="ocr-preview">
          {previewUrl && <img src={previewUrl} alt="Selected exam question" />}
          <div className="ocr-file-details">
            <span>{file.name}</span>
            <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
          </div>
          <div className="ocr-preview-actions">
            <button type="button" onClick={removeImage} disabled={isReading}>Remove</button>
            <button className="ocr-read-button" type="button" onClick={handleReadImage} disabled={isReading}>
              {isReading ? "Reading image…" : "Extract text"}
            </button>
          </div>
        </div>
      )}

      {error && <p className="ocr-error" role="alert">{error}</p>}
    </section>
  );
}
