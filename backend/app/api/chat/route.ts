import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { message, context } = await req.json();

        // Check for API Key
        if (!process.env.OPENROUTER_API_KEY) {
            return NextResponse.json({ 
                response: "OpenRouter API Key is missing. Please add OPENROUTER_API_KEY to your .env.local file in the backend." 
            });
        }

        // Determine Role-Specific Expertise for the LLM personality
        const level = context?.level || 0;
        const role = context?.role || 'User';
        let expertise = "You are a general ERP facilitator.";
        
        if (level >= 5) {
            expertise = "You are a Platform Master Consultant. You specialize in global company management, multi-tenant architecture, and system-wide analytics.";
        } else if (level === 4) {
            expertise = "You are a Business Operations Expert. You focus on company-specific branches, department management, and employee onboarding.";
        } else if (role.includes('STUDENT')) {
            expertise = "You are an Academic Success Guide. You help students with their courses, batch schedules, learning materials, and academic performance.";
        } else if (role.includes('TUTOR') || role.includes('TEACHER')) {
            expertise = "You are an Educational Workflow Assistant. You help teachers manage their batches, mark attendance, and track student submissions.";
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "HTTP-Referer": `http://localhost:3000`, 
                "X-Title": `Durkkas ERP AI`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": "openrouter/auto",
                "messages": [
                    {
                        "role": "system",
                        "content": `You are the Durkkas OS AI, an intelligent layer built into a high-end Enterprise ERP. 
                        User: ${context?.userName || 'User'} (${role}).
                        Context: ${expertise}
                        Portal: ${context?.portal || 'Home'}.
                        Rules:
                        1. Always be professional, concise, and helpful.
                        2. Never reveal system internal secrets.
                        3. If asked about features you aren't sure of, suggest they check the sidebar navigation.
                        4. Support multiple modules: CRM, HRMS, LMS, EMS, and Finance.`
                    },
                    {
                        "role": "user",
                        "content": message
                    }
                ]
            })
        });

        const data = await response.json();
        
        if (data.error) {
            console.error("OpenRouter Error:", data.error);
            return NextResponse.json({ 
                response: `Error from LLM: ${data.error.message || 'Unknown error'}` 
            });
        }

        const aiResponse = data.choices?.[0]?.message?.content || "I'm currently processing your request but couldn't get a clear answer. Please refine your question.";

        return NextResponse.json({ response: aiResponse });
    } catch (error: any) {
        console.error("Chat Route Error:", error);
        return NextResponse.json({ error: "Failed to connect to AI service" }, { status: 500 });
    }
}
