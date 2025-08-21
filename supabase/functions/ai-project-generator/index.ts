import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, outputFormat, colorTheme, template, animations, specialRequests, apiKeys } = await req.json();

    // Determine the best framework based on the project description
    const determineFramework = (description: string, template: string, specialRequests: string): string => {
      const desc = description.toLowerCase();
      const tmpl = template.toLowerCase();
      const special = specialRequests.toLowerCase();

      // Check special requests first for specific framework mentions
      if (special.includes('react')) return 'react';
      if (special.includes('vue')) return 'vue';
      if (special.includes('angular')) return 'angular';
      if (special.includes('svelte')) return 'svelte';
      if (special.includes('next')) return 'next';
      if (special.includes('nuxt')) return 'nuxt';
      if (special.includes('python') || special.includes('flask') || special.includes('django')) return 'python';
      if (special.includes('php')) return 'php';
      if (special.includes('node') || special.includes('express')) return 'node';
      if (special.includes('vanilla') || special.includes('html')) return 'vanilla';

      // Complex web applications - use React
      if (desc.includes('dashboard') || desc.includes('admin') || desc.includes('complex') || 
          desc.includes('interactive') || desc.includes('real-time') || tmpl.includes('dashboard') ||
          desc.includes('spa') || desc.includes('single page')) {
        return 'react';
      }

      // E-commerce or SaaS - use Next.js for SSR benefits
      if (desc.includes('ecommerce') || desc.includes('store') || desc.includes('shop') || 
          desc.includes('saas') || desc.includes('payment') || tmpl.includes('ecommerce') || 
          tmpl.includes('saas') || desc.includes('seo')) {
        return 'next';
      }

      // API or backend heavy - use appropriate backend framework
      if (desc.includes('api') || desc.includes('backend') || desc.includes('server') ||
          desc.includes('database') || desc.includes('rest') || desc.includes('graphql')) {
        return 'node';
      }

      // Simple websites - use vanilla for performance
      if (desc.includes('simple') || desc.includes('static') || desc.includes('landing') || 
          desc.includes('marketing') || tmpl.includes('landing') || desc.includes('brochure')) {
        return 'vanilla';
      }

      // Portfolio or blog - Vue for balance of simplicity and features
      if (desc.includes('portfolio') || desc.includes('blog') || desc.includes('personal') || 
          tmpl.includes('portfolio') || tmpl.includes('blog')) {
        return 'vue';
      }

      // Default to React for most modern web applications
      return 'react';
    };

    const framework = determineFramework(description, template || '', specialRequests || '');

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
      model = 'meta-llama/llama-3.2-3b-instruct:free';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['HTTP-Referer'] = 'https://webcrafter.ai';
      headers['X-Title'] = 'AI Website Builder';
    } else if (apiKeys?.openai && apiKeys.openai.trim()) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = apiKeys.openai;
      model = 'gpt-4o-mini';
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (apiKeys?.deepseek && apiKeys.deepseek.trim()) {
      apiUrl = 'https://api.deepseek.com/chat/completions';
      apiKey = apiKeys.deepseek;
      model = 'deepseek-coder';
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (apiKeys?.gemini && apiKeys.gemini.trim()) {
      // Note: Gemini has a different API structure, this is simplified
      throw new Error('Gemini API integration coming soon');
    } else if (apiKeys?.anthropic && apiKeys.anthropic.trim()) {
      apiUrl = 'https://api.anthropic.com/v1/messages';
      apiKey = apiKeys.anthropic;
      model = 'claude-3-haiku-20240307';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      throw new Error('No valid API key provided. Please configure at least one API key.');
    }

    const formatInstructions = {
      'react': 'React with TypeScript and Tailwind CSS',
      'vue': 'Vue 3 with Composition API and Tailwind CSS',
      'angular': 'Angular with TypeScript and Tailwind CSS',
      'svelte': 'Svelte with TypeScript and Tailwind CSS',
      'vanilla': 'Vanilla HTML, CSS, and JavaScript',
      'next': 'Next.js with TypeScript and Tailwind CSS',
      'nuxt': 'Nuxt 3 with TypeScript and Tailwind CSS'
    };

    const colorThemeMapping = {
      'blue': { primary: '#3B82F6', secondary: '#1E40AF', accent: '#DBEAFE' },
      'purple': { primary: '#8B5CF6', secondary: '#5B21B6', accent: '#EDE9FE' },
      'green': { primary: '#10B981', secondary: '#047857', accent: '#D1FAE5' },
      'orange': { primary: '#F59E0B', secondary: '#D97706', accent: '#FEF3C7' },
      'pink': { primary: '#EC4899', secondary: '#BE185D', accent: '#FCE7F3' },
      'dark': { primary: '#1F2937', secondary: '#111827', accent: '#F9FAFB' },
      'red': { primary: '#EF4444', secondary: '#DC2626', accent: '#FEE2E2' },
      'yellow': { primary: '#EAB308', secondary: '#CA8A04', accent: '#FEF3C7' },
      'indigo': { primary: '#6366F1', secondary: '#4F46E5', accent: '#E0E7FF' },
      'teal': { primary: '#14B8A6', secondary: '#0D9488', accent: '#CCFBF1' },
      'cyan': { primary: '#06B6D4', secondary: '#0891B2', accent: '#CFFAFE' },
      'lime': { primary: '#84CC16', secondary: '#65A30D', accent: '#ECFCCB' }
    };

    // Handle custom colors
    let themeColors;
    try {
      themeColors = colorTheme.startsWith('{') ? JSON.parse(colorTheme) : colorThemeMapping[colorTheme as keyof typeof colorThemeMapping];
    } catch {
      themeColors = colorThemeMapping[colorTheme as keyof typeof colorThemeMapping] || colorThemeMapping.blue;
    }

    const systemPrompt = `You are an expert full-stack developer who creates complete, production-ready applications. You MUST create fully functional, deployable projects that work exactly like professional development platforms.

Project Requirements:
- Title: ${title}
- Description: ${description}
- Framework: ${framework} (${formatInstructions[framework as keyof typeof formatInstructions] || 'HTML/CSS/JS'})
- Color Theme: ${JSON.stringify(themeColors)}
- Template Base: ${template || 'Custom'}
- Animations: ${animations.join(', ') || 'None'}
- Special Requests: ${specialRequests || 'None'}

CRITICAL REQUIREMENTS - You MUST implement ALL of these:

1. **COMPLETE PROJECT STRUCTURE**: Create a fully working project with all necessary files including:
   - Complete source code files with proper file organization
   - Package.json with all required dependencies (if framework project)
   - Configuration files (tailwind.config, vite.config, etc.)
   - README.md with setup instructions
   - .gitignore file
   - All supporting files needed for deployment

2. **PRODUCTION-READY CODE**: 
   - Write clean, maintainable, well-commented code
   - Use modern best practices and patterns
   - Include proper error handling
   - Implement responsive design that works on all devices
   - Add proper accessibility features (ARIA labels, semantic HTML)
   - Include loading states and user feedback

3. **REAL FUNCTIONALITY**: No mockups or placeholders:
   - All buttons and forms must work
   - Include proper state management
   - Add actual animations and interactions
   - Implement proper routing (if applicable)
   - Include real API integration examples where relevant

4. **COMPREHENSIVE FEATURES**:
   - Multiple pages/components as needed
   - Navigation system
   - Contact forms with validation
   - Interactive elements and animations
   - Search functionality (if applicable)
   - User interface components
   - Data handling and storage examples

5. **MODERN DEVELOPMENT STANDARDS**:
   - TypeScript for type safety (when applicable)
   - Component-based architecture
   - Proper CSS organization with Tailwind
   - Performance optimizations
   - SEO best practices with proper meta tags
   - Mobile-first responsive design

6. **DEPLOYMENT READY**:
   - Include build scripts and configurations
   - Optimize for production deployment
   - Include environment configuration examples
   - Add deployment instructions in README

Respond in this exact JSON format:
{
  "files": {
    "filename.ext": "complete file content with no truncation",
    "folder/filename.ext": "complete file content"
  },
  "structure": "Detailed explanation of project architecture and file organization",
  "features": ["Comprehensive list of all implemented features and functionality"],
  "instructions": "Complete setup, development, and deployment instructions including all commands needed",
  "framework": "${framework}",
  "dependencies": ["List of all required dependencies and their purposes"]
}

IMPORTANT: 
- Do NOT truncate any file content - provide complete, working files
- Include ALL necessary files for a complete project
- Make it production-ready and fully functional
- Ensure all code follows modern best practices
- Create a project that can be immediately deployed and used

Generate a comprehensive, professional application that exceeds expectations and provides real value.`;

    let requestBody: any;
    
    if (apiUrl.includes('anthropic')) {
      requestBody = {
        model,
        max_tokens: 8000,
        messages: [{ role: 'user', content: systemPrompt }]
      };
    } else {
      requestBody = {
        model,
        messages: [{ role: 'user', content: systemPrompt }],
        max_tokens: 8000,
        temperature: 0.8,
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
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    let aiResponse;
    
    if (apiUrl.includes('anthropic')) {
      aiResponse = data.content[0]?.text;
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
      throw new Error('Failed to parse AI response');
    }

    console.log('AI Project Generator Response:', parsedResponse);

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-project-generator:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        files: {},
        structure: 'Error generating project',
        features: [],
        instructions: 'Please try again with different parameters'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});