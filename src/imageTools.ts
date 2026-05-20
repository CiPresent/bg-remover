import { removeBackground } from "@imgly/background-removal";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 12 * 1024 * 1024;

export type ValidationResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      message: string;
    };

export function validateImageFile(file: File): ValidationResult {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      ok: false,
      message: "Vui lòng chọn ảnh PNG, JPG, JPEG hoặc WebP."
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      ok: false,
      message: "Ảnh tối đa 12 MB cho MVP này."
    };
  }

  return { ok: true };
}

export async function removeImageBackground(file: File): Promise<Blob> {
  return removeBackground(file, {
    output: {
      format: "image/png",
      quality: 1
    }
  });
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function getOutputFilename(file: File): string {
  const cleanName = file.name.replace(/\.[^.]+$/, "").replace(/[^\w-]+/g, "-");
  return `${cleanName || "cutclean"}-no-bg.png`;
}
