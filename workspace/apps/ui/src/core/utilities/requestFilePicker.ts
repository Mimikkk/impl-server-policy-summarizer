interface RequestFilePickerOptions {
  types: string[];
}

export const requestFilePicker = async ({ types }: RequestFilePickerOptions): Promise<File | undefined> => {
  const { promise, resolve } = Promise.withResolvers<File | undefined>();

  const input = document.createElement("input");
  input.type = "file";
  input.accept = types.join(",");

  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement)?.files?.[0];
    resolve(file);
  };

  input.click();

  return await promise;
};

export const requestSaveFile = (file: File): void => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
};
