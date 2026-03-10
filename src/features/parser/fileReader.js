const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function readFileAsText(file) {
  if (!file) throw new Error("Файл не выбран");
  if (file.size > MAX_BYTES) {
    throw new Error("Файл слишком большой (лимит 5MB для демо)");
  }

  // Можно использовать Blob.text() (promise-based), но тут оставим FileReader
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.addEventListener("load", () => resolve(String(reader.result ?? "")));
    reader.addEventListener("error", () =>
      reject(reader.error ?? new Error("Ошибка чтения файла"))
    );
    reader.readAsText(file);
  });
}
