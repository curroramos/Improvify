import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Prompt = {
  id: string;
  emoji: string;
  question: string;
  isEnabled: boolean;
};

export type PromptTemplate = {
  id: string;
  name: string;
  description: string;
  prompts: Omit<Prompt, 'id' | 'isEnabled'>[];
};

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'daily-reflection',
    name: 'Daily Reflection',
    description: 'Classic end-of-day reflection prompts',
    prompts: [
      { emoji: '💡', question: 'What was the highlight of your day?' },
      { emoji: '🔥', question: 'What challenged you today?' },
      { emoji: '🙏', question: 'What are you grateful for?' },
      { emoji: '📚', question: 'What did you learn today?' },
      { emoji: '🔧', question: 'How will you improve tomorrow?' },
    ],
  },
  {
    id: 'gratitude',
    name: 'Gratitude Focus',
    description: 'Cultivate appreciation and positivity',
    prompts: [
      { emoji: '🙏', question: "What are three things you're grateful for today?" },
      { emoji: '💝', question: 'Who made a positive impact on you today?' },
      { emoji: '✨', question: 'What simple pleasure did you enjoy?' },
      { emoji: '🌟', question: 'What went better than expected?' },
    ],
  },
  {
    id: 'three-good-things',
    name: 'Three Good Things',
    description: 'Simple daily wins - one good thing at a time',
    prompts: [
      { emoji: '1️⃣', question: 'What was the first good thing that happened today?' },
      { emoji: '2️⃣', question: 'What was another good thing from today?' },
      { emoji: '3️⃣', question: 'What was one more good thing today?' },
    ],
  },
  {
    id: 'growth-mindset',
    name: 'Growth Mindset',
    description: 'Focus on learning and improvement',
    prompts: [
      { emoji: '🧠', question: 'What new skill or knowledge did you gain?' },
      { emoji: '💪', question: 'How did you push outside your comfort zone?' },
      { emoji: '🎯', question: 'What mistake taught you something valuable?' },
      { emoji: '🚀', question: "What's one thing you want to try tomorrow?" },
    ],
  },
  {
    id: 'mindfulness',
    name: 'Mindfulness',
    description: 'Present-moment awareness and self-care',
    prompts: [
      { emoji: '🧘', question: 'How are you feeling right now, in this moment?' },
      { emoji: '💭', question: 'What thoughts kept coming up today?' },
      { emoji: '❤️', question: 'How did you take care of yourself today?' },
      { emoji: '🌊', question: 'What can you let go of before tomorrow?' },
    ],
  },
  {
    id: 'productivity',
    name: 'Productivity Review',
    description: 'Track progress and plan ahead',
    prompts: [
      { emoji: '✅', question: 'What did you accomplish today?' },
      { emoji: '⏰', question: 'How did you spend your most productive hours?' },
      { emoji: '🚧', question: 'What blocked your progress?' },
      { emoji: '📋', question: 'What are your top 3 priorities for tomorrow?' },
    ],
  },
  {
    id: 'relationships',
    name: 'Relationships',
    description: 'Nurture connections with others',
    prompts: [
      { emoji: '👥', question: 'Who did you connect with today?' },
      { emoji: '💬', question: 'What meaningful conversation did you have?' },
      { emoji: '🤝', question: 'How did you help someone today?' },
      { emoji: '💌', question: 'Who would you like to reach out to?' },
    ],
  },
];

const DEFAULT_PROMPTS: Prompt[] = [
  { id: '1', emoji: '💡', question: 'What was the highlight of your day?', isEnabled: true },
  { id: '2', emoji: '🔥', question: 'What challenged you today?', isEnabled: true },
  { id: '3', emoji: '🙏', question: 'What are you grateful for?', isEnabled: true },
  { id: '4', emoji: '📚', question: 'What did you learn today?', isEnabled: true },
  { id: '5', emoji: '🔧', question: 'How will you improve tomorrow?', isEnabled: true },
];

type PromptsState = {
  prompts: Prompt[];
  addPrompt: (emoji: string, question: string) => void;
  updatePrompt: (id: string, emoji: string, question: string) => void;
  deletePrompt: (id: string) => void;
  togglePrompt: (id: string) => void;
  reorderPrompts: (prompts: Prompt[]) => void;
  movePrompt: (id: string, direction: 'up' | 'down') => void;
  resetToDefaults: () => void;
  applyTemplate: (templateId: string) => void;
  getEnabledPrompts: () => Prompt[];
};

export const usePromptsStore = create(
  persist<PromptsState>(
    (set, get) => ({
      prompts: DEFAULT_PROMPTS,

      addPrompt: (emoji, question) =>
        set((state) => ({
          prompts: [
            ...state.prompts,
            {
              id: Date.now().toString(),
              emoji,
              question,
              isEnabled: true,
            },
          ],
        })),

      updatePrompt: (id, emoji, question) =>
        set((state) => ({
          prompts: state.prompts.map((p) => (p.id === id ? { ...p, emoji, question } : p)),
        })),

      deletePrompt: (id) =>
        set((state) => ({
          prompts: state.prompts.filter((p) => p.id !== id),
        })),

      togglePrompt: (id) =>
        set((state) => ({
          prompts: state.prompts.map((p) => (p.id === id ? { ...p, isEnabled: !p.isEnabled } : p)),
        })),

      reorderPrompts: (prompts) => set({ prompts }),

      movePrompt: (id, direction) =>
        set((state) => {
          const index = state.prompts.findIndex((p) => p.id === id);
          if (index === -1) return state;

          const newIndex = direction === 'up' ? index - 1 : index + 1;
          if (newIndex < 0 || newIndex >= state.prompts.length) return state;

          const newPrompts = [...state.prompts];
          [newPrompts[index], newPrompts[newIndex]] = [newPrompts[newIndex], newPrompts[index]];

          return { prompts: newPrompts };
        }),

      resetToDefaults: () => set({ prompts: DEFAULT_PROMPTS }),

      applyTemplate: (templateId: string) => {
        const template = PROMPT_TEMPLATES.find((t) => t.id === templateId);
        if (!template) return;

        const newPrompts: Prompt[] = template.prompts.map((p, index) => ({
          id: `template-${Date.now()}-${index}`,
          emoji: p.emoji,
          question: p.question,
          isEnabled: true,
        }));

        set({ prompts: newPrompts });
      },

      getEnabledPrompts: () => get().prompts.filter((p) => p.isEnabled),
    }),
    {
      name: 'reflection-prompts',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
