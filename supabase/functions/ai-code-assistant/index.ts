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

    const context = `You are an intelligent AI coding agent for Lovable.dev. You must analyze requests, generate complete working code, and provide structured responses for real-time implementation.

CRITICAL RESPONSE FORMAT:
Always respond with valid JSON in this exact structure:
{
  "analysis": "Brief analysis of what needs to be done",
  "files": {
    "filename.ext": "COMPLETE file content with all changes applied"
  },
  "summary": "What was implemented",
  "response": "User-friendly confirmation message"
}

AGENT BEHAVIOR:
1. DEEP ANALYSIS: Understand the user's request completely
2. COMPLETE IMPLEMENTATION: Provide full, working file contents (never truncated)
3. REAL-TIME READY: Generate code that can be immediately applied
4. ERROR-FREE: Ensure all code is syntactically correct and functional
5. MODERN STANDARDS: Use React 18+, TypeScript, Tailwind CSS best practices

CURRENT PROJECT CONTEXT:
Project ID: ${projectId}
Files: ${Object.keys(projectContent).join(', ')}
User Request: "${message}"

CONVERSATION HISTORY:
${conversationHistory?.slice(-5).map(msg => `${msg.type}: ${msg.content}`).join('\n') || 'No prior conversation'}

PROJECT FILES:
${Object.entries(projectContent).map(([file, content]) => 
  `=== ${file} ===\n${content.substring(0, 2000)}${content.length > 2000 ? '\n[TRUNCATED - Full content available]' : ''}\n`
).join('\n')}

REQUIREMENTS:
- Always provide COMPLETE file contents
- Never use placeholders like "// ... rest of component"
- Ensure all imports, exports, and syntax are correct
- Handle TypeScript types properly
- Use semantic design tokens from tailwind.config.ts
- Implement proper error handling and loading states
- Follow React best practices and hooks usage rules

CRITICAL: Your response must be valid JSON that can be parsed immediately.`;

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
      // Try to parse the AI response as JSON
      parsedResponse = JSON.parse(aiResponse);
      
      // Normalize response format for compatibility
      if (!parsedResponse.files && parsedResponse.codeChanges) {
        // Convert old format to new format
        const files: { [key: string]: string } = {};
        parsedResponse.codeChanges.forEach((change: any) => {
          if (change.file && change.content) {
            files[change.file] = change.content;
          }
        });
        parsedResponse.files = files;
      }
      
      // Ensure response has required fields
      if (!parsedResponse.response && !parsedResponse.analysis) {
        parsedResponse.response = "Changes have been applied successfully.";
      }
      
    } catch (e) {
      console.error('JSON parsing error:', e, 'Raw response:', aiResponse);
      
      // Try to extract code changes from non-JSON response
      const codeBlockRegex = /```[\w]*\n([\s\S]*?)\n```/g;
      const matches = [...aiResponse.matchAll(codeBlockRegex)];
      
      if (matches.length > 0) {
        const files: { [key: string]: string } = {};
        matches.forEach((match, index) => {
          const filename = `generated-file-${index + 1}.tsx`;
          files[filename] = match[1];
        });
        
        parsedResponse = {
          analysis: "Extracted code from AI response",
          files,
          summary: "Generated code files from AI response",
          response: "Code extracted and applied successfully."
        };
      } else {
        // Complete fallback
        parsedResponse = { 
          analysis: "AI response could not be parsed",
          response: aiResponse.substring(0, 500) + (aiResponse.length > 500 ? '...' : ''),
          files: {},
          summary: "Response processed but no code changes identified"
        };
      }
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