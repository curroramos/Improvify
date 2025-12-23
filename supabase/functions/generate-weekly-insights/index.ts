import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');

interface NoteData {
  title: string;
  content: string;
  created_at: string;
}

interface ChallengeData {
  title: string;
  points: number;
  completed: boolean;
  created_at: string;
}

interface RequestBody {
  notes: NoteData[];
  challenges: ChallengeData[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { notes, challenges }: RequestBody = await req.json();

    if (!Array.isArray(notes) || !Array.isArray(challenges)) {
      return new Response(
        JSON.stringify({ error: 'Invalid input: notes and challenges must be arrays' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate stats
    const totalChallenges = challenges.length;
    const completedChallenges = challenges.filter(c => c.completed).length;
    const completionRate = totalChallenges > 0
      ? Math.round((completedChallenges / totalChallenges) * 100)
      : 0;
    const totalPointsEarned = challenges
      .filter(c => c.completed)
      .reduce((sum, c) => sum + c.points, 0);

    // Build context for AI
    const reflectionsSummary = notes.length > 0
      ? notes.map(n => `- ${n.title}: ${n.content.substring(0, 200)}...`).join('\n')
      : 'No reflections this week.';

    const challengesSummary = challenges.length > 0
      ? challenges.map(c => `- ${c.title} (${c.points}pts): ${c.completed ? 'Completed' : 'Not completed'}`).join('\n')
      : 'No challenges this week.';

    const PROMPT = `
You are a JSON API for a personal growth app. Always return only a valid JSON object, with no preamble, no markdown, no explanations.

Analyze this user's week and provide insights:

REFLECTIONS (${notes.length} total):
${reflectionsSummary}

CHALLENGES (${totalChallenges} total, ${completedChallenges} completed, ${completionRate}% completion rate):
${challengesSummary}

Generate insights in this exact JSON format:
{
  "summary": "A 2-3 sentence personalized summary of their week, highlighting key themes and progress",
  "patterns": [
    {
      "type": "positive" | "negative" | "neutral",
      "title": "Short pattern name",
      "description": "Brief explanation of the pattern observed"
    }
  ],
  "recommendations": [
    {
      "title": "Actionable recommendation title",
      "description": "Brief explanation of why and how"
    }
  ]
}

Rules:
- Return 2-4 patterns based on what you observe
- Return 2-3 recommendations
- Be specific and reference their actual reflections/challenges
- If data is limited, acknowledge it and give general encouragement
- Keep descriptions concise (under 100 characters each)
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
        temperature: 0.6,
        max_tokens: 1500,
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

    // Parse and validate JSON
    let parsed;
    try {
      parsed = JSON.parse(aiContent);
    } catch {
      console.error('Failed to parse AI response:', aiContent);
      return new Response(
        JSON.stringify({ error: 'AI returned invalid JSON' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate structure
    if (!parsed.summary || !Array.isArray(parsed.patterns) || !Array.isArray(parsed.recommendations)) {
      return new Response(
        JSON.stringify({ error: 'Invalid insights format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Return insights with calculated stats
    const result = {
      summary: parsed.summary,
      patterns: parsed.patterns,
      recommendations: parsed.recommendations,
      stats: {
        totalReflections: notes.length,
        totalChallenges,
        completedChallenges,
        completionRate,
        totalPointsEarned,
      }
    };

    return new Response(
      JSON.stringify(result),
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
