import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../.env.local") });

async function testOpenRouter() {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
        console.error("❌ OPENROUTER_API_KEY not found in .env.local");
        return;
    }

    console.log("🕒 Testing OpenRouter connectivity...");

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "mistralai/mistral-7b-instruct:free",
                "messages": [
                    { "role": "user", "content": "Hello! Confirm if you are working for Durkkas ERP AI Assistant." }
                ]
            })
        });

        const data: any = await response.json();
        
        if (data.error) {
            console.error("❌ OpenRouter Error:", data.error);
        } else {
            console.log("✅ Success! Response from LLM:");
            console.log(data.choices?.[0]?.message?.content || "No content found in response.");
        }
    } catch (err: any) {
        console.error("❌ Connection failed:", err.message);
    }
}

testOpenRouter();
