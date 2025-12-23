import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

// Life categories for the Wheel of Life
const LIFE_CATEGORIES = [
  'health',
  'career',
  'finance',
  'relationships',
  'personal_growth',
  'fun',
  'environment',
  'spirituality',
] as const;

type LifeCategory = typeof LIFE_CATEGORIES[number];

function isValidCategory(category: string): category is LifeCategory {
  return LIFE_CATEGORIES.includes(category as LifeCategory);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Theme prompt modifiers - keep in sync with src/config/themes.ts
  const THEME_PROMPTS: Record<string, string> = {
    default: '',
    christian: `
FAITH-BASED CONTEXT:
- Frame challenges with a faith-based perspective when appropriate
- Include references to prayer, Scripture reading, or spiritual disciplines where relevant
- Emphasize serving others, gratitude, and glorifying God
- Suggest challenges that align with Christian values (love, patience, kindness, humility)
- For spirituality category, focus on Christian spiritual practices (prayer, Bible study, worship, fellowship)
- Use encouraging, faith-affirming language`,
    stoic: `
STOIC PHILOSOPHY CONTEXT:
- Frame challenges through the lens of Stoic philosophy
- Emphasize what is within one's control vs what is not
- Include practices like journaling, negative visualization, or voluntary discomfort
- Focus on virtue (wisdom, courage, justice, temperance)
- Encourage reflection on mortality (memento mori) and impermanence
- Use calm, rational, and practical language`,
    minimalist: `
MINIMALIST CONTEXT:
- Keep challenges simple and focused on essentials
- Emphasize quality over quantity
- Include practices around decluttering (physical, digital, mental)
- Focus on intentionality and mindful consumption
- Encourage elimination of unnecessary commitments
- Use concise, clear language`,
  };

  try {
    const { reflection, themeId = 'default' } = await req.json();

    if (!reflection || typeof reflection !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid reflection' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const themePrompt = THEME_PROMPTS[themeId] || '';

    const PROMPT = `
You are a JSON API. Always return only a valid JSON object, with no preamble, no markdown, no explanations. Do not include \`\`\`json or any other formatting.

Based on the following reflection, generate 3 measurable challenges for tomorrow. Each challenge must:
1. Have a clear, actionable title
2. Include a brief description explaining the task
3. Have a point value between 10-50 (harder = more points)
4. Be assigned to ONE life category from this list:
   - health: Physical fitness, nutrition, sleep, mental wellness
   - career: Professional growth, skills, work tasks
   - finance: Money management, savings, financial goals
   - relationships: Family, friends, social connections
   - personal_growth: Learning, self-improvement, new skills
   - fun: Hobbies, entertainment, leisure activities
   - environment: Living space, organization, surroundings
   - spirituality: Mindfulness, meditation, purpose, inner peace
${themePrompt}

IMPORTANT: Analyze the content of each challenge and assign the MOST relevant category. Try to create challenges across different life areas when possible.

ONLY respond with a **raw JSON object** in this exact format (no extra text):

{
  "challenges": [
    {
      "title": "string",
      "description": "string",
      "points": 10-50,
      "category": "one of: health|career|finance|relationships|personal_growth|fun|environment|spirituality"
    }
  ]
}

Reflection: ${reflection}
`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that only returns valid JSON with no extra text.'
          },
          {
            role: 'user',
            content: PROMPT
          }
        ],
        temperature: 0.5,
        max_tokens: 1000,
        top_p: 0.9
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'AI service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiContent = data.choices?.[0]?.message?.content?.trim();

    if (!aiContent) {
      return new Response(
        JSON.stringify({ error: 'No content from AI' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate JSON
    let parsed;
    try {
      parsed = JSON.parse(aiContent);
    } catch {
      return new Response(
        JSON.stringify({ error: 'AI returned invalid JSON' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate challenges structure
    if (!Array.isArray(parsed.challenges) || parsed.challenges.length !== 3) {
      return new Response(
        JSON.stringify({ error: 'Invalid challenges format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and sanitize each challenge
    const validatedChallenges = parsed.challenges.map((challenge: {
      title?: string;
      description?: string;
      points?: number;
      category?: string;
    }) => {
      // Validate required fields
      if (!challenge.title || !challenge.description || typeof challenge.points !== 'number') {
        throw new Error('Invalid challenge structure');
      }

      // Validate and default category
      const category = challenge.category && isValidCategory(challenge.category)
        ? challenge.category
        : 'personal_growth';

      // Clamp points to valid range
      const points = Math.min(50, Math.max(10, Math.round(challenge.points)));

      return {
        title: challenge.title,
        description: challenge.description,
        points,
        category,
      };
    });

    return new Response(
      JSON.stringify({ challenges: validatedChallenges }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
