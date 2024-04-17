import type { ZodError, ZodType } from "zod";

const validateSchema = (url: string, response: JSON, parser: ZodType) => {
	if (!parser) {
		return false;
	}

	const { success, error, data } = parser?.safeParse(response) as {
		success: boolean;
		error: ZodError;
		data: unknown;
	};

	if (success) {
		return data as typeof parser;
	}

	error.issues.forEach((issue) => {
		const { code, path, message } = issue;

		const errorMessage = `Unexpected API response from ${url}: ${code} at '${path.join(
			".",
		)}'`;

		console.warn(issue, url, errorMessage);
	});

	return false;
};

export default validateSchema;
