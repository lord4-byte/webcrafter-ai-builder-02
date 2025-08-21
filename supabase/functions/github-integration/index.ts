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
    const { action, projectName, projectFiles, githubToken, repoName } = await req.json();

    if (!githubToken) {
      throw new Error('GitHub token is required');
    }

    const headers = {
      'Authorization': `token ${githubToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    if (action === 'create-repo') {
      // Create repository
      const repoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: repoName || projectName.toLowerCase().replace(/\s+/g, '-'),
          description: `AI-generated project: ${projectName}`,
          private: false,
          auto_init: false
        })
      });

      if (!repoResponse.ok) {
        const error = await repoResponse.json();
        throw new Error(`Failed to create repository: ${error.message}`);
      }

      const repo = await repoResponse.json();
      const repoUrl = repo.clone_url;
      const repoFullName = repo.full_name;

      // Upload files to repository
      const fileUploads = [];
      for (const [fileName, content] of Object.entries(projectFiles)) {
        const uploadResponse = await fetch(`https://api.github.com/repos/${repoFullName}/contents/${fileName}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `Add ${fileName}`,
            content: btoa(unescape(encodeURIComponent(content as string))),
            branch: 'main'
          })
        });

        if (!uploadResponse.ok) {
          console.error(`Failed to upload ${fileName}`);
        } else {
          fileUploads.push(fileName);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        repoUrl,
        repoName: repoFullName,
        uploadedFiles: fileUploads,
        message: `Repository created successfully! Uploaded ${fileUploads.length} files.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'push-changes') {
      // Push changes to existing repository
      const fileUpdates = [];
      for (const [fileName, content] of Object.entries(projectFiles)) {
        // Get current file SHA if it exists
        let sha = null;
        try {
          const fileResponse = await fetch(`https://api.github.com/repos/${repoName}/contents/${fileName}`, {
            headers
          });
          if (fileResponse.ok) {
            const fileData = await fileResponse.json();
            sha = fileData.sha;
          }
        } catch (e) {
          // File doesn't exist, that's okay
        }

        const updateResponse = await fetch(`https://api.github.com/repos/${repoName}/contents/${fileName}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            message: `Update ${fileName}`,
            content: btoa(unescape(encodeURIComponent(content as string))),
            sha: sha || undefined,
            branch: 'main'
          })
        });

        if (!updateResponse.ok) {
          console.error(`Failed to update ${fileName}`);
        } else {
          fileUpdates.push(fileName);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        updatedFiles: fileUpdates,
        message: `Successfully updated ${fileUpdates.length} files in repository.`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      throw new Error('Invalid action specified');
    }

  } catch (error) {
    console.error('GitHub integration error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});