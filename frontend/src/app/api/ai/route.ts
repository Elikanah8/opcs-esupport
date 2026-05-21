import { NextRequest, NextResponse } from "next/server";

// AI route using Groq API — free tier, no credit card required
export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Call Groq API using OpenAI-compatible endpoint
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an expert IT support assistant for the Office of the Prime Cabinet Secretary (OPCS), Republic of Kenya.
Your job is to help staff resolve common IT issues quickly and professionally.
Provide clear, step-by-step troubleshooting guidance.
Keep responses concise, practical, and easy to follow.
If an issue cannot be resolved through self-service, advise the user to submit a support ticket.
Common issues you handle: printer problems, WiFi connectivity, Outlook and email setup, PDF conversion, VPN issues, slow computers, screen resolution, software installation.`,
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("AI route error:", error);
    return NextResponse.json(
      { error: "AI assistant is currently unavailable. Please try again." },
      { status: 500 }
    );
  }
}