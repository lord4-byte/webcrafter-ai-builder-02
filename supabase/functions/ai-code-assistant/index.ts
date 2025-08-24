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
    
    // Determine which API to use based on available keys
    let apiUrl = '';
    let apiKey = '';
    let model = '';
    let headers: any = {
      'Content-Type': 'application/json',
    };

    if (apiKeys?.openrouter && apiKeys.openrouter.trim()) {
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      apiKey = apiKeys.openrouter;
      model = apiKeys?.selectedModels?.openrouter || 'meta-llama/llama-3.2-3b-instruct:free';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['HTTP-Referer'] = 'https://webcrafter.ai';
      headers['X-Title'] = 'AI Website Builder';
    } else if (apiKeys?.openai && apiKeys.openai.trim()) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = apiKeys.openai;
      model = apiKeys?.selectedModels?.openai || 'gpt-5-2025-08-07';
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (apiKeys?.deepseek && apiKeys.deepseek.trim()) {
      apiUrl = 'https://api.deepseek.com/chat/completions';
      apiKey = apiKeys.deepseek;
      model = 'deepseek-coder';
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (apiKeys?.gemini && apiKeys.gemini.trim()) {
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKeys.gemini}`;
      apiKey = apiKeys.gemini;
      model = 'gemini-2.5-flash';
      headers['Content-Type'] = 'application/json';
    } else if (apiKeys?.anthropic && apiKeys.anthropic.trim()) {
      apiUrl = 'https://api.anthropic.com/v1/messages';
      apiKey = apiKeys.anthropic;
      model = apiKeys?.selectedModels?.anthropic || 'claude-3-5-haiku-20241022';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['anthropic-version'] = '2023-06-01';
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

    const context = `You are an advanced AI web app builder and agent. You work directly with code files - no explanations, just code modifications. When user requests changes, modifications, or fixes, respond with updated file contents.

Current project files: ${JSON.stringify(projectContent, null, 2)}
User message: ${message}

IMPORTANT: 
- Always provide COMPLETE file contents, never truncated
- Apply the user's request directly to the code
- Generate production-ready, functional code
- Use modern React patterns, TypeScript, and Tailwind CSS
- Ensure all functionality works properly

Respond with valid JSON: {"response": "Changes applied successfully. Preview updated.", "codeChanges": [{"file": "filename", "content": "complete updated file content"}]}`;

    let requestBody: any;
    
    if (apiUrl.includes('anthropic')) {
      requestBody = {
        model,
        max_tokens: 8000,
        messages: [{ role: 'user', content: context }]
      };
    } else if (apiUrl.includes('gemini')) {
      requestBody = {
        contents: [{
          parts: [{
            text: context
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 8000,
          responseMimeType: "application/json"
        }
      };
    } else {
      requestBody = {
        model,
        messages: [{ role: 'user', content: context }],
        max_tokens: 8000,
        temperature: 0.7,
        top_p: 0.9,
        response_format: { type: 'json_object' }
      };
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    let aiResponse;
    
    if (apiUrl.includes('anthropic')) {
      aiResponse = data.content[0]?.text;
    } else if (apiUrl.includes('gemini')) {
      aiResponse = data.candidates[0]?.content?.parts[0]?.text;
    } else {
      aiResponse = data.choices[0]?.message?.content;
    }

    if (!aiResponse) {
      throw new Error('No response from AI');
    }
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      console.error('JSON parsing error:', e);
      // Provide fallback response
      parsedResponse = { 
        response: "Changes applied. Unable to parse full response.", 
        codeChanges: [] 
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('AI Code Assistant Error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Request failed',
      response: 'I encountered an error processing your request. Please try again or check your API configuration.',
      codeChanges: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});