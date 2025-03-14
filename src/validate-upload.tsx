import Papa from "papaparse"

const validationSchemas = {
    "1_individuals.csv": ["id", "name", "surname", "nickname", "sex", "YOB", "ethnic", "clan", "notes"],
    "2_relationships.csv": ["person_id", "father_id", "mother_id", "notes"],
    "3_families.csv": ["husband_id", "wife_id"],
}

export const validateUploadedFiles = (files: FileList | null) => {
    if (!files) return null
    // Validate file names
    const expectedFilenames = Object.keys(validationSchemas)
    if (!validateFilenames(Array.from(files), expectedFilenames)) {
        return null  // TODO: raise Exception with message
    }
    // Basic content validations
    const fileReadPromises = Array.from(files).map(file => {
        return new Promise<File | null>((resolve) => {
            const reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = () => {
                const fileContent = reader.result as string;
                const validFile = validateFile(file.name, fileContent);
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
        const invalidFiles = Array.from(files)
            .filter((file: File) => !validFiles.some(validFile => validFile.name === file.name))
            .map(file => `'${file.name}'`)
            .join(", ");
        if (invalidFiles) {
            // setErrors(["Files had errors. You can check them in the browser console"])  TODO: add to errors bundle
        }
        // Validate number of files
        if (!validFiles || validFiles.length < 3 || validFiles.length > 3) {
            console.error("Wrong number of uploaded files...")
            return null  // TODO: raise Exception with message
        }
        // (event.target as HTMLInputElement).value = ''; // Reset the file input
        return validFiles
    });
}

function validateFilenames(files: File[], validFilenames: string[]): boolean {
    for (const file of files) {
        const filename = file.name;
        if (!validFilenames.includes(filename)) {
            console.error(`Invalid filename: ${filename}`);
            return false;
        }
    }
    return true;
}

function validateFile(filename: string, content: string) {
    const parsedData = Papa.parse(content, { header: true, skipEmptyLines: true });
    if (parsedData.errors.length) {
        console.error("CSV loading errors:", parsedData.errors);
        return false;
    }
    const rows = parsedData.data as Record<string, string>[];
    return validateColumns(filename, rows, validationSchemas[filename])
}

function validateColumns(filename: string, rows: Record<string, string>[], requiredColumns: string[]) {
    const headers = Object.keys(rows[0]);
    // Check for missing columns
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    if (missingColumns.length) {
        const error = `${filename}: the following required columns are missing: ${missingColumns.join(", ")}`
        console.error(error);
        return false;
    }
    return true;
}