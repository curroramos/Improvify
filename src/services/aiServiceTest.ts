import { OpenAI } from "openai";

(async () => {
	const client = new OpenAI({
		baseURL: "https://router.huggingface.co/novita",
		apiKey: "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"
	});

	const chatCompletion = await client.chat.completions.create({
		model: "deepseek/deepseek-v3-0324",
		messages: [
			{ role: "user", content: "hola bro\n\n" }		],
		temperature: 0.5,
		max_tokens: 2048,
		top_p: 0.7,
	});

	console.log(chatCompletion.choices[0].message);
})();
