import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nuestraFormacion, formacionRival } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API Key de Gemini no configurada" },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Actúa como un analista táctico de fútbol de élite.
Vamos a jugar un partido.
Nuestra formación es: ${nuestraFormacion}
La formación rival (esperada) es: ${formacionRival}

Por favor, analiza este emparejamiento táctico.
Proporciona:
1. Ventajas tácticas que tendremos.
2. Posibles riesgos o debilidades en defensa.
3. Recomendaciones clave para dominar el partido (zonas a explotar, presión, etc.).
Usa un formato Markdown limpio, con listas y encabezados. Sé conciso pero muy analítico.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return NextResponse.json({
      text: response.text,
    });
  } catch (error) {
    console.error("Error en API de tácticas:", error);
    return NextResponse.json(
      { error: "Error al generar el análisis" },
      { status: 500 }
    );
  }
}
