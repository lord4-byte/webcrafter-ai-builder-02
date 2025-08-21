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
    const { title, description, outputFormat, colorTheme, template, animations, specialRequests, apiKeys } = await req.json();

    // Determine the best framework based on the project description - DEFAULT TO REACT
    const determineFramework = (description: string, template: string, specialRequests: string): string => {
      const desc = description.toLowerCase();
      const tmpl = template.toLowerCase();
      const special = specialRequests.toLowerCase();

      // Check special requests first for specific framework mentions
      if (special.includes('vue') && !special.includes('react')) return 'vue';
      if (special.includes('angular') && !special.includes('react')) return 'angular';
      if (special.includes('svelte') && !special.includes('react')) return 'svelte';
      if (special.includes('nuxt') && !special.includes('react')) return 'nuxt';
      if (special.includes('python') || special.includes('flask') || special.includes('django')) return 'python';
      if (special.includes('php')) return 'php';
      if (special.includes('node') || special.includes('express')) return 'node';
      if (special.includes('vanilla') || special.includes('html')) return 'vanilla';
      if (special.includes('next')) return 'next';

      // E-commerce or SaaS - use Next.js for SSR benefits (unless React specified)
      if (!special.includes('react') && (desc.includes('ecommerce') || desc.includes('store') || desc.includes('shop') || 
          desc.includes('saas') || desc.includes('payment') || tmpl.includes('ecommerce') || 
          tmpl.includes('saas') || desc.includes('seo'))) {
        return 'next';
      }

      // API or backend heavy - use Node.js (unless React frontend specified)
      if (!special.includes('frontend') && !special.includes('react') && (desc.includes('api') || desc.includes('backend') || desc.includes('server') ||
          desc.includes('database') || desc.includes('rest') || desc.includes('graphql'))) {
        return 'node';
      }

      // Simple static websites - use vanilla (unless React specified)
      if (!special.includes('react') && (desc.includes('simple') || desc.includes('static') || desc.includes('landing') || 
          desc.includes('marketing') || tmpl.includes('landing') || desc.includes('brochure'))) {
        return 'vanilla';
      }

      // Portfolio or blog - Use React (changed from Vue to align with default)
      if (desc.includes('portfolio') || desc.includes('blog') || desc.includes('personal') || 
          tmpl.includes('portfolio') || tmpl.includes('blog')) {
        return 'react';
      }

      // DEFAULT TO REACT for ALL modern web applications - production-ready React with TypeScript
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
      'react': 'React with TypeScript, Vite, and Tailwind CSS (PRODUCTION-READY)',
      'vue': 'Vue 3 with Composition API, TypeScript, and Tailwind CSS',
      'angular': 'Angular with TypeScript and Tailwind CSS',
      'svelte': 'Svelte with TypeScript and Tailwind CSS',
      'vanilla': 'Vanilla HTML5, Modern CSS3, and ES6+ JavaScript',
      'next': 'Next.js with TypeScript, App Router, and Tailwind CSS',
      'nuxt': 'Nuxt 3 with TypeScript and Tailwind CSS',
      'python': 'Python with Flask/FastAPI and modern frontend',
      'php': 'PHP with modern frontend integration',
      'node': 'Node.js with Express and REST/GraphQL API'
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

    const systemPrompt = `You are an expert full-stack developer and AI agent who creates complete, production-ready applications exactly like Lovable.dev. You MUST generate fully functional, deployable projects with NO placeholders, NO mockups, and REAL implementations.

🎯 PROJECT SPECIFICATION:
- Title: ${title}
- Description: ${description}
- Framework: ${framework} (${formatInstructions[framework as keyof typeof formatInstructions] || 'React with TypeScript'})
- Color Theme: ${JSON.stringify(themeColors)}
- Template Base: ${template || 'Custom Build'}
- Animations: ${animations.join(', ') || 'Smooth Transitions'}
- Special Requests: ${specialRequests || 'None'}

🚀 MANDATORY REQUIREMENTS - YOU MUST IMPLEMENT ALL:

1. **COMPLETE PROJECT STRUCTURE**: Create a fully working project with all necessary files including:
   - Complete source code files with proper file organization
   - Package.json with all required dependencies (if framework project)
   - Configuration files (tailwind.config, vite.config, etc.)
   - README.md with setup instructions
   - .gitignore file
   - All supporting files needed for deployment

2. **PRODUCTION-READY CODE WITH ZERO PLACEHOLDERS**: 
   - Write COMPLETE, clean, maintainable code with detailed comments
   - Use cutting-edge best practices and design patterns
   - Include comprehensive error handling and loading states
   - Implement fully responsive design that works perfectly on all devices
   - Add complete accessibility features (ARIA labels, semantic HTML, keyboard navigation)
   - Include smooth animations and professional UI/UX

3. **100% REAL FUNCTIONALITY**: ABSOLUTELY NO MOCKUPS:
   - ALL buttons, forms, and interactive elements MUST work completely
   - Include sophisticated state management (Context API, reducers, custom hooks)
   - Add beautiful, smooth animations and micro-interactions
   - Implement complete routing with protected routes and navigation
   - Include working API integration patterns and data fetching
   - Add real form validation, error handling, and success states

4. **COMPREHENSIVE FEATURE SET**:
   - Multiple interconnected pages/components with full navigation
   - Complete navigation system with mobile menu and breadcrumbs
   - Working contact forms with full validation and submission handling
   - Rich interactive elements, hover effects, and animations
   - Functional search with filtering and sorting (where applicable)
   - Professional UI component library with variants and states
   - Complete data handling with local storage, caching, and persistence

5. **CUTTING-EDGE DEVELOPMENT STANDARDS**:
   - TypeScript throughout with proper interfaces and type safety
   - Advanced component architecture with composition patterns
   - Sophisticated Tailwind CSS with custom configurations and themes
   - Performance optimizations (lazy loading, code splitting, memoization)
   - Complete SEO implementation with meta tags, structured data, and OpenGraph
   - Mobile-first responsive design with perfect cross-device compatibility

6. **ENTERPRISE DEPLOYMENT READY**:
   - Complete build scripts, configurations, and optimization
   - Production deployment configurations for Vercel, Netlify, AWS
   - Environment configuration with proper secret management
   - Comprehensive documentation with setup, development, and deployment guides
   - CI/CD pipeline configurations and automated testing setup

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