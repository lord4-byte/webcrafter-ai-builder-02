import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import OpenAI from "https://deno.land/x/openai@v4.67.3/mod.ts";

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
      // Use OpenAI SDK with OpenRouter configuration
      const openrouter = new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKeys.openrouter,
        defaultHeaders: {
          'HTTP-Referer': 'https://webcrafter.ai',
          'X-Title': 'WebCrafter AI',
        },
      });
      
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      apiKey = apiKeys.openrouter;
      model = apiKeys?.selectedModels?.openrouter || 'meta-llama/llama-3.1-70b-instruct:free';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['HTTP-Referer'] = 'https://webcrafter.ai';
      headers['X-Title'] = 'WebCrafter AI';
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

    const context = `You are an advanced AI agent that acts like Lovable.dev's AI assistant. You modify code files directly and apply changes in real-time.

CRITICAL AGENT BEHAVIOR:
- Act as a strict AGENT - directly modify code files, never show code snippets in responses
- Analyze the user's request thoroughly before making any changes
- Apply modifications directly to the generated code files
- Respond only with confirmation messages like "Changes applied successfully. Preview updated."
- Never output code blocks, JSON structures, or technical details in the response

ANALYSIS PROCESS:
1. Understand the exact user request and its implications
2. Identify which files need modification
3. Plan the optimal solution approach
4. Generate complete, production-ready code
5. Apply changes directly to project files

Current project files: ${JSON.stringify(projectContent, null, 2)}
User message: ${message}

REQUIREMENTS:
- Provide COMPLETE file contents, never truncated or partial
- Use modern React patterns, TypeScript, and Tailwind CSS
- Ensure all functionality works properly and handles edge cases
- Make code production-ready with proper error handling
- Apply best practices for performance and maintainability

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