import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// Hardcoded templates
const templates = [
  {
    title: 'Default Reflection',
    content: `💡 **What was the highlight of your day?**

🔥 **What challenged you today?**

🙏 **What are you grateful for today?**

📚 **What did you learn today?**

🔧 **How will you improve tomorrow?**
`
  },
  {
    title: 'Goal Setting',
    content: `🎯 **What's your main goal today?**

📌 **Why does it matter?**

📝 **Steps to accomplish it:**

⏰ **Timeline / Deadline:**

✅ **How will you measure success?**
`
  },
  {
    title: 'None',
    content: '',
  },
];

export default function TemplateSelectorScreen() {
  const router = useRouter();

  const handleSelectTemplate = (templateContent: string) => {
    // Pass the chosen template content back to our CreateNoteScreen
    router.push({
      pathname: '../notes',  // <-- Adjust path if needed
      params: { content: templateContent },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Choose a Template</Text>
      {templates.map((template, index) => (
        <Pressable
          key={index}
          onPress={() => handleSelectTemplate(template.content)}
          style={({ pressed }) => [
            styles.templateButton,
            pressed && { opacity: 0.7 },
          ]}
        >
          <Text style={styles.templateButtonText}>{template.title}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    alignSelf: 'center',
  },
  templateButton: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  templateButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
