import {EmptyFileError, validateFile, validateFilenames} from "./upload-validate-schemas";

export const uploadValidation = (
    uploadedFiles: FileList,
    files: File[],
    validationSchemas: Record<string, string[]>,
    onComplete: (validFiles: File[], errors: Error[]) => void
) => {
    // Check number of uploaded files
    if (uploadedFiles.length + files.length > Object.keys(validationSchemas).length) {
        console.log("Too many files uploaded")
    }

    // Validate filenames and filter out the ones that are not our templates
    const validFilenames = validateFilenames(uploadedFiles, Object.keys(validationSchemas))
    const newFiles = Array.from(uploadedFiles).filter(file => validFilenames.has(file.name));

    Promise.allSettled(
        newFiles.map(file =>
            new Promise<File | null>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsText(file, "UTF-8");
                // Basic schema validation
                reader.onload = () => {
                    try {
                        const fileValidated = validateFile(file.name, reader.result as string, validationSchemas)
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
