# App Store Submission Guide

## Quick Reference

| Item | Value |
|------|-------|
| App Name | Improvify |
| Bundle ID | `com.improvify.app` |
| Version | 1.0.0 |
| Build Number | 1 |
| Category | Health & Fitness |
| Age Rating | 4+ |

---

## Test Account for Apple Review

```
[Provide test credentials privately via App Store Connect review notes]
```

---

## Legal URLs

| Document | URL |
|----------|-----|
| Privacy Policy | https://pie-trick-820.notion.site/Privacy-Policy-2d1847dece68804c86e2ce5a5eff52ad |
| Terms of Service | https://pie-trick-820.notion.site/Terms-of-Service-2d1847dece6880478f1aebed7737671d |
| Support | mailto:francisco_ramos@berkeley.edu |

---

## Build Commands

### Step 1: EAS Setup (First Time Only)

```bash
# Install EAS CLI if needed
npm install -g eas-cli

# Login to Expo account
eas login

# Initialize project (adds projectId to app.json)
eas init
```

### Step 2: Build for iOS

```bash
# Production build for App Store
eas build --platform ios --profile production
```

This will:
- Prompt you to log in to Apple Developer account
- Create/select App Store Connect app
- Generate certificates automatically
- Build in the cloud (~20-30 min)

### Step 3: Submit to App Store

```bash
# After build completes
eas submit --platform ios
```

Or submit manually:
1. Download the `.ipa` from EAS dashboard
2. Use Transporter app (Mac) to upload
3. Go to App Store Connect to complete submission

---

## App Store Connect Setup

### 1. Create App in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - Platform: iOS
   - Name: `Improvify`
   - Primary Language: English (U.S.)
   - Bundle ID: `com.improvify.app`
   - SKU: `improvify-ios-001`

### 2. App Information Tab

| Field | Value |
|-------|-------|
| Subtitle | Journal → Challenges → Growth |
| Category | Health & Fitness |
| Secondary Category | Lifestyle |
| Content Rights | Does not contain third-party content |
| Age Rating | Complete questionnaire (all "None") → 4+ |

### 3. Pricing and Availability

- Price: Free
- Availability: All countries (or select specific)

### 4. App Privacy

Answer these in App Store Connect:

**Do you collect data?** Yes

**Data Types:**
- ✅ Contact Info → Email Address (Account purposes)
- ✅ User Content → Other User Content (Journal entries)
- ✅ Identifiers → User ID (App functionality)
- ✅ Usage Data → Product Interaction (Analytics)

**Tracking:** No

### 5. Version Information

#### Screenshots Required

| Device | Size | Required |
|--------|------|----------|
| iPhone 6.7" | 1290 x 2796 | ✅ Yes |
| iPhone 6.5" | 1284 x 2778 | Optional |
| iPhone 5.5" | 1242 x 2208 | ✅ Yes |

**Screenshot Order:**
1. Home screen with challenges
2. Writing a reflection
3. Wheel of Life radar chart
4. Streak calendar
5. Profile with level

#### Promotional Text
```
Write once, grow daily. AI turns your reflections into personalized challenges across 8 life areas. Build streaks, earn XP, level up.
```

#### Description
```
Your journal shouldn't just collect dust. Make it work for you.

Improvify turns your daily reflections into personalized challenges that help you grow. Write about your day, and AI generates 3 actionable tasks tailored to your thoughts—not generic advice from the internet.

━━━━━━━━━━━━━━━━━━━━━━

HOW IT WORKS

① Write a reflection about your day
② AI reads it and creates 3 challenges just for you
③ Complete challenges to earn XP and level up
④ Track your growth across 8 life areas

━━━━━━━━━━━━━━━━━━━━━━

THE WHEEL OF LIFE

See your balance across what matters:
• Health & Fitness
• Career & Work
• Finance & Money
• Relationships & Social
• Personal Growth
• Fun & Recreation
• Environment & Home
• Spirituality & Purpose

The radar chart shows where you're thriving and where to focus next.

━━━━━━━━━━━━━━━━━━━━━━

STAY MOTIVATED

◆ Daily Streaks — Build consistency. Don't break the chain.
◆ Streak Shields — Life happens. Shields protect your streak.
◆ XP & Levels — Earn points, climb from Beginner to Grandmaster.
◆ Weekly Insights — AI summarizes your patterns and progress.

━━━━━━━━━━━━━━━━━━━━━━

CHOOSE YOUR PHILOSOPHY

Pick a theme that resonates:

• Classic — The original Improvify experience
• Faith — Scripture-based inspiration and spiritual growth
• Stoic — Ancient wisdom for modern challenges
• Minimalist — Focus on what truly matters

Your theme shapes the tone of your challenges and daily quotes.

━━━━━━━━━━━━━━━━━━━━━━

PRIVATE BY DESIGN

Your journal is yours. We don't read it, sell it, or share it. All data is encrypted. Delete anytime.

━━━━━━━━━━━━━━━━━━━━━━

Stop just thinking about change. Start making it happen.

Download Improvify and turn today's reflection into tomorrow's growth.
```

#### Keywords
```
journal,reflection,habits,challenges,self-improvement,growth,mindfulness,streak,goals,ai,wellness
```

#### What's New
```
Welcome to Improvify!

• Write reflections and journal entries
• Get 3 AI-generated challenges from each reflection
• Track your Wheel of Life across 8 categories
• Build streaks with daily reflections
• Earn XP and climb 9 levels
• Choose from 4 themes: Classic, Faith, Stoic, Minimalist
• Weekly AI insights on your patterns
• Dark mode support
```

#### Support URL
```
mailto:francisco_ramos@berkeley.edu
```

#### Marketing URL (Optional)
```
(leave blank if no website)
```

#### Privacy Policy URL
```
https://pie-trick-820.notion.site/Privacy-Policy-2d1847dece68804c86e2ce5a5eff52ad
```

> **Note:** Notion pages are acceptable for App Store submission. Ensure the page is set to "Share to web" (public).

### 6. App Review Information

#### Contact Information
- First Name: [Your first name]
- Last Name: [Your last name]
- Phone: [Your phone]
- Email: francisco_ramos@berkeley.edu

#### Demo Account

> **🔒 SECURITY:** Do NOT store credentials in this file. Add test account credentials directly in App Store Connect under "App Review Information" → "Sign-in required" → "Demo Account".
>
> Ensure the test account has:
> - 5+ journal reflections
> - 12+ completed challenges
> - Active streak data
> - Level 3+ progress

#### Notes for Review
```
Thank you for reviewing Improvify!

WHAT THIS APP DOES:
Improvify is a personal journal that uses AI to generate actionable challenges from user reflections. Users earn XP, maintain streaks, and track progress across 8 life categories.

ACCOUNT REQUIRED:
Yes, to save data. Email + password authentication via Supabase.

AI FEATURES:
- Challenges are generated using the Deepseek API
- Requires internet connection
- AI analyzes journal text to create personalized tasks
- User reflection data is processed in real-time and NOT permanently stored by Deepseek
- AI responses are validated server-side (must return exactly 3 challenges with valid categories)
- Prompts include content guidelines to ensure appropriate, actionable challenges
- No user-generated content is displayed to other users

NOTIFICATIONS (4 daily reminders):
This is a habit-tracking app. Notifications are a CORE FEATURE for building daily reflection habits:
- 8:00 AM: Morning reminder (gentle)
- 2:00 PM: Afternoon nudge (if no reflection yet)
- 7:00 PM: Evening reminder (if no reflection yet)
- 10:00 PM: Final reminder (only if user has active streak to protect)

Users can disable notifications entirely in Settings → Notifications. The frequency is intentional for habit formation, similar to meditation and fitness apps.

FAITH-BASED THEME:
The app includes an optional "Faith" theme with Bible verses and Christian prompts. This is user-selected (not default) and contains no mature content—only positive, encouraging scripture references appropriate for all ages.

NO IN-APP PURCHASES:
Version 1.0 is completely free.

If you have any questions, please reach out: francisco_ramos@berkeley.edu
```

---

## Pre-Submission Checklist

### Code & Build
- [x] TypeScript compiles without errors
- [x] ESLint passes (no errors)
- [x] iOS export succeeds
- [x] Bundle ID set: `com.improvify.app`
- [x] Version: 1.0.0, Build: 1
- [x] App icon: 1024x1024 RGB PNG
- [x] Permission descriptions added

### Legal
- [x] Privacy Policy hosted and accessible
- [x] Terms of Service hosted and accessible
- [x] In-app links working (Settings → About)

### Test Account
- [x] Test account created: test@improvify.app
- [x] Test account has sample reflections (5 notes)
- [x] Test account has completed challenges (12 completed, 3 pending)
- [x] Test account shows XP/level progress (Level 3, 590 XP)

### App Store Connect
- [ ] Apple Developer Program enrolled ($99)
- [ ] App created in App Store Connect
- [ ] Screenshots uploaded (6.7" and 5.5")
- [ ] Description and metadata filled
- [ ] Privacy labels configured
- [ ] Age rating completed
- [ ] Build uploaded via EAS

### Final
- [ ] Test on real device via TestFlight
- [ ] All features working
- [ ] No crashes on launch
- [ ] Submit for review

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Bundle ID already exists" | Use different bundle ID or claim existing |
| Build fails on EAS | Check `eas build --platform ios --profile production --clear-cache` |
| Certificates error | Let EAS manage them automatically, or revoke old ones in Apple Developer |
| App rejected: Privacy | Make sure Privacy Policy URL is publicly accessible |
| App rejected: Crashes | Test on real device, check Supabase connection |
| App rejected: Login | Ensure test account works, check auth flow |

---

## Timeline

| Step | Duration |
|------|----------|
| EAS Build | 20-30 min |
| Upload to App Store | 5-10 min |
| App Store Review | 24-48 hours (usually) |
| **Total** | **1-3 days** |

---

## After Approval

1. App goes live automatically (or manually if you chose)
2. Monitor reviews in App Store Connect
3. Check crash reports in Xcode/App Store Connect
4. Plan v1.1 based on user feedback

---

## Support Contacts

- EAS Issues: https://expo.dev/support
- Apple Developer: https://developer.apple.com/contact
- App Review: Appeal through App Store Connect

---

*Last updated: December 22, 2024*
