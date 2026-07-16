const IMAGE_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

function extensionOf(url: string): string {
  const path = url.split("?")[0];
  const match = /\.([a-z0-9]+)$/i.exec(path);
  return match ? match[1].toLowerCase() : "";
}

export function isImageUrl(url: string): boolean {
  return IMAGE_EXTENSIONS.has(extensionOf(url));
}
