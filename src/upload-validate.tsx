import {validateFile, validateFilenames} from "./upload-validate-schemas";

export const uploadValidation = (newFiles: FileList | null, files: File[], validationSchemas: Record<string, string[]>) => {
    if (!newFiles || newFiles.length === 0) return null;

    // Validate number of uploaded files
    if (newFiles.length + files.length > Object.keys(validationSchemas).length) {
        throw new Error("Too many files");
    }

    // Validate filenames
    validateFilenames(Array.from(newFiles), Object.keys(validationSchemas))

    // Basic schema validation
    const fileReadPromises = Array.from(newFiles).map(file => {
        return new Promise<File | null>((resolve) => {
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = () => {
                const fileContent = reader.result as string;
                const validFile = validateFile(file.name, fileContent, validationSchemas);
                if (validFile) {
                    resolve(file);
                } else {
                    resolve(null);
                }
            };
            reader.onerror = () => {
                console.error("Error reading file:", file.name);
                // setErrors(["Error reading file:" + file.name])  TODO: add to errors bundle
                resolve(null); // Resolve as null to exclude invalid files
            };
        });
    });

    // Wait for all file validations to complete
    Promise.all(fileReadPromises).then(results => {
        const validFiles = results.filter((file): file is File => file !== null);
        const invalidFiles = Array.from(newFiles)
            .filter((file: File) => !validFiles.some(validFile => validFile.name === file.name))
            .map(file => `'${file.name}'`)
            .join(", ");
        if (invalidFiles) {
            // setErrors(["Files had errors. You can check them in the browser console"])  TODO: add to errors bundle
        }
        // Validate number of files
        if (!validFiles || validFiles.length < 3 || validFiles.length > 3) {
            console.error("Wrong number of uploaded files...")
            return null  // TODO: reject(new Error(`Invalid file format: ${file.name}`));
        }
        // (event.target as HTMLInputElement).value = ''; // Reset the file input
        return validFiles;
    });
}
