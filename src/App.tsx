import {
  Check,
  Download,
  FileImage,
  ImagePlus,
  Loader2,
  Coffee,
  Sparkles,
  Upload,
  X
} from "lucide-react";
import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import {
  downloadBlob,
  getOutputFilename,
  removeImageBackground,
  validateImageFile
} from "./imageTools";

type AppStatus = "idle" | "selected" | "processing" | "done" | "error";
type BackgroundMode = "transparent" | "white" | "color";

function App() {
  const [status, setStatus] = useState<AppStatus>("idle");
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalPreviewUrl, setOriginalPreviewUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultBlobUrl, setResultBlobUrl] = useState<string | null>(null);
  const [backgroundMode, setBackgroundMode] = useState<BackgroundMode>("transparent");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const previewSurfaceClass = useMemo(() => {
    if (backgroundMode === "transparent") return "preview-surface checkerboard";
    if (backgroundMode === "white") return "preview-surface white-bg";
    return "preview-surface color-bg";
  }, [backgroundMode]);

  function clearObjectUrl(url: string | null) {
    if (url) URL.revokeObjectURL(url);
  }

  function resetResult() {
    clearObjectUrl(resultBlobUrl);
    setResultBlob(null);
    setResultBlobUrl(null);
  }

  function setFileForPreview(file: File) {
    const validation = validateImageFile(file);

    if (!validation.ok) {
      setErrorMessage(validation.message);
      setStatus("error");
      return;
    }

    clearObjectUrl(originalPreviewUrl);
    resetResult();
    setOriginalFile(file);
    setOriginalPreviewUrl(URL.createObjectURL(file));
    setErrorMessage(null);
    setStatus("selected");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) setFileForPreview(file);
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) setFileForPreview(file);
  }

  async function handleRemoveBackground() {
    if (!originalFile) return;

    setStatus("processing");
    setErrorMessage(null);

    try {
      const blob = await removeImageBackground(originalFile);
      const url = URL.createObjectURL(blob);

      clearObjectUrl(resultBlobUrl);
      setResultBlob(blob);
      setResultBlobUrl(url);
      setStatus("done");
    } catch (error) {
      console.error(error);
      setErrorMessage("Could not remove the background. Try another image.");
      setStatus("error");
    }
  }

  function handleDownload() {
    if (!resultBlob || !originalFile) return;
    downloadBlob(resultBlob, getOutputFilename(originalFile));
  }

  function clearSelection() {
    clearObjectUrl(originalPreviewUrl);
    resetResult();
    setOriginalFile(null);
    setOriginalPreviewUrl(null);
    setErrorMessage(null);
    setStatus("idle");
  }

  const hasResult = status === "done" && resultBlobUrl;
  const canProcess = Boolean(originalFile) && status !== "processing";

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <Sparkles size={17} />
          </span>
          <span>CutClean</span>
        </div>

        <nav className="nav-links" aria-label="Main navigation">
          <a className="coffee-link" href="https://www.buymeacoffee.com/" target="_blank" rel="noreferrer">
            <Coffee size={16} />
            Buy me a Coffee
          </a>
        </nav>
      </header>

      <section className="tool-card" id="tool">
        <div className="intro">
          <h1>Remove image background</h1>
          <p>Upload one image. Get a transparent PNG.</p>
        </div>

        <section className="preview-grid" aria-label="Image previews">
          <article className="preview-card">
            <div className="preview-header">
              <span>Original</span>
            </div>
            <div
              className={`preview-surface original-surface ${isDragging ? "dragging" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {originalPreviewUrl ? (
                <img src={originalPreviewUrl} alt="Original upload preview" />
              ) : (
                <div className="drop-empty-state">
                  <span className="drop-empty-icon">
                    <Upload size={28} />
                  </span>
                  <strong>Drop image here</strong>
                  <small>or use the upload button below</small>
                </div>
              )}
            </div>

            <div className={`file-row ${originalFile ? "" : "placeholder"}`}>
              {originalFile ? (
                <ImagePlus size={16} />
              ) : (
                <FileImage size={16} />
              )}
              <span>{originalFile?.name ?? "No file selected"}</span>
              {originalFile ? (
                <button type="button" onClick={clearSelection} aria-label="Remove selected image">
                  <X size={15} />
                </button>
              ) : (
                <span className="file-row-spacer" aria-hidden="true" />
              )}
            </div>

            {status === "processing" ? (
              <div className="status-note" role="status">
                First run may take a little longer while the model loads.
              </div>
            ) : null}

            {errorMessage ? <div className="error-box">{errorMessage}</div> : null}

            <div className="original-toolbar">
              <label
                className={`upload-button ${isDragging ? "dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                />
                <Upload size={17} />
                Upload image
              </label>

              <button
                className="primary-button"
                type="button"
                disabled={!canProcess}
                onClick={handleRemoveBackground}
              >
                {status === "processing" ? (
                  <>
                    <Loader2 className="spin" size={18} />
                    Processing
                  </>
                ) : (
                  "Remove background"
                )}
              </button>
            </div>
          </article>

          <article className="preview-card result-card">
            <div className="preview-header">
              <span>Result</span>
              {hasResult ? (
                <small>
                  <Check size={13} />
                  Ready
                </small>
              ) : null}
            </div>
            <div className={previewSurfaceClass}>
              {resultBlobUrl ? (
                <img src={resultBlobUrl} alt="Background removed result preview" />
              ) : status === "processing" ? (
                <div className="empty-state loading">
                  <Loader2 className="spin" size={24} />
                  Working...
                </div>
              ) : (
                <span className="empty-state">Your transparent PNG will appear here</span>
              )}
            </div>

            <div className="result-toolbar">
              <div className="background-options" aria-label="Preview background">
                <button
                  className={backgroundMode === "transparent" ? "active" : ""}
                  type="button"
                  disabled={!hasResult}
                  onClick={() => setBackgroundMode("transparent")}
                >
                  Transparent
                </button>
                <button
                  className={backgroundMode === "white" ? "active" : ""}
                  type="button"
                  disabled={!hasResult}
                  onClick={() => setBackgroundMode("white")}
                >
                  White
                </button>
                <button
                  className={backgroundMode === "color" ? "active" : ""}
                  type="button"
                  disabled={!hasResult}
                  onClick={() => setBackgroundMode("color")}
                >
                  Color
                </button>
              </div>

              <button
                className="secondary-button"
                type="button"
                disabled={!hasResult}
                onClick={handleDownload}
              >
                <Download size={17} />
                Download PNG
              </button>
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}

export default App;
