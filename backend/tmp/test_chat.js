// e:\ERP\CLONE\foundation_durkkas\backend\tmp\test_chat.js
const { config } = require("dotenv");
const path = require("path");

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
                "model": "openrouter/auto",
                "messages": [
                    { "role": "user", "content": "Hello! Confirm if you are working for Durkkas ERP AI Assistant." }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("❌ OpenRouter Error:", JSON.stringify(data.error, null, 2));
        } else {
            console.log("✅ Success! Response from LLM:");
            console.log(data.choices?.[0]?.message?.content || "No content found in response.");
        }
    } catch (err) {
        console.error("❌ Connection failed:", err.message);
    }
}

testOpenRouter();
