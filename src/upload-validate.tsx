import Papa from "papaparse";

export class CouldNotReadError extends Error {}
export class EmptyFileError extends Error {}

export const uploadValidation = (
    uploadedFiles: FileList,
    files: File[],
    validationSchemas: Set<string>,
    onComplete: (validFiles: File[], errors: Error[]) => void
) => {
    // Check number of uploaded files
    if (uploadedFiles.length + files.length > validationSchemas.size) {
        console.log("Too many files uploaded")
    }

    // Validate filenames and filter out the ones that are not our templates
    const validFilenames = validateFilenames(uploadedFiles, validationSchemas)
    const newFiles = Array.from(uploadedFiles).filter(file => validFilenames.has(file.name));

    Promise.allSettled(
        newFiles.map(file =>
            new Promise<File | null>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                // Basic schema validation
                reader.onload = () => {
                    try {
                        const fileValidated = validateFile(file.name, reader.result as string)
                        resolve(fileValidated ? file : null);
                    } catch (error) {
                        reject(error);
                    }
                };
                // Generic load error
                reader.onerror = () => reject(new Error(`Error reading file: ${file.name}`));
            })
        )
    ).then(promiseResults => {
        const validFiles: File[] = [];
        const errors: Error[] = [];
        promiseResults.forEach(promiseResult => {
            if (promiseResult.status === "fulfilled") {
                validFiles.push(promiseResult.value!);
            } else if (promiseResult.status === "rejected") {
                errors.push(promiseResult.reason);
            }
        });
        if (validFiles.length < 3) {
            console.warn("Still missing some required files...");
        }
        onComplete(validFiles, errors);
    });
}

function validateFilenames(files: FileList, expectedFilenames: Set<string>): Set<string> {
    const validFilenames = new Set<string>();
    const invalidFilenames = new Set<string>();
    Array.from(files).forEach(f => (expectedFilenames.has(f.name) ? validFilenames : invalidFilenames).add(f.name));
    if (invalidFilenames.size > 0) {
        console.error(`These are not the 🤖 we are looking for: ${[...invalidFilenames].join(", ")}`);
    }
    return validFilenames;
}

function validateFile(filename: string, content: string): boolean {
    const parsedData = Papa.parse(content, { header: true, skipEmptyLines: true });
    if (parsedData.errors.length) {
        throw new CouldNotReadError(filename)
    }
    const rows = parsedData.data as Record<string, string>[];
    if (!rows.length) {
        throw new EmptyFileError(filename)
    }
    return true
}
