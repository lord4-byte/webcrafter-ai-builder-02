import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, projectContent, projectId, conversationHistory, apiKeys } = await req.json();
    
    let apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    let apiKey = apiKeys?.openrouter || '';
    let model = apiKeys?.selectedModels?.openrouter || 'meta-llama/llama-3.2-3b-instruct:free';
    
    if (!apiKey && apiKeys?.openai) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = apiKeys.openai;
      model = apiKeys?.selectedModels?.openai || 'gpt-4o-mini';
    }
    
    if (!apiKey) {
      return new Response(JSON.stringify({ 
        error: 'No API key configured',
        response: 'Please configure your API keys in Settings.',
        codeChanges: []
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const context = `You are an advanced AI web app builder like Lovable.dev. Generate complete, functional web applications with React, modern UI, and comprehensive features. Always provide COMPLETE file contents, never truncated. When user provides code snippets, integrate them properly into the source code. Enhance basic requests into full-featured applications.

Current project files: ${JSON.stringify(projectContent, null, 2)}
User message: ${message}

Respond with valid JSON: {"response": "explanation", "codeChanges": [{"file": "name", "content": "complete code"}]}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://webcrafter.ai',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: context }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || '{"response": "Error generating response", "codeChanges": []}';
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      parsedResponse = { response: aiResponse, codeChanges: [] };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Request failed',
      response: 'Please try again or check your API configuration.',
      codeChanges: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});