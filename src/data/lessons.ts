export interface Lesson {
  id: string;
  levelId: number;
  order: number;
  title: string;
  description: string;
  bibleVerse: string;
  bibleRef: string;
  reflection: string;
  videoUrl?: string;
  xp: number;
  type: "lesson" | "quiz";
}

export interface QuizOption {
  label: string;
  text: string;
  description: string;
}

export interface Quiz {
  id: string;
  levelId: number;
  order: number;
  title: string;
  question: string;
  options: QuizOption[];
  xp: number;
  type: "quiz";
}

export interface Level {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  requiredXp: number;
  icon: string;
}

export const levels: Level[] = [
  {
    id: 0,
    title: "Introduction",
    subtitle: "Exploring Faith",
    description: "Reflect about life, purpose, and spiritual values.",
    requiredXp: 100,
    icon: "🌱",
  },
  {
    id: 1,
    title: "First Steps",
    subtitle: "Foundations of Faith",
    description: "Learn the core truths of Christianity and begin your relationship with God.",
    requiredXp: 200,
    icon: "🌿",
  },
  {
    id: 2,
    title: "Spiritual Habits",
    subtitle: "Growing Deeper",
    description: "Develop daily practices that nurture your faith.",
    requiredXp: 250,
    icon: "🌳",
  },
  {
    id: 3,
    title: "Living Faith",
    subtitle: "Faith in Action",
    description: "Apply your faith to every area of life.",
    requiredXp: 300,
    icon: "🌻",
  },
];

export const lessons: (Lesson | Quiz)[] = [
  // Level 0
  {
    id: "0-1",
    levelId: 0,
    order: 1,
    title: "What Does It Mean to Be a Christian Today?",
    description: "Christianity is not just a religion — it's a relationship with God through Jesus Christ. In a world full of noise, being a Christian means choosing to follow Jesus and letting His love transform your life from the inside out.",
    bibleVerse: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.",
    bibleRef: "John 3:16",
    reflection: "What does being a Christian mean to you personally?",
    videoUrl: "https://www.youtube.com/embed/7hUKXnFnXe0",
    xp: 25,
    type: "lesson",
  },
  {
    id: "0-2",
    levelId: 0,
    order: 2,
    title: "Material Success vs Spiritual Purpose",
    description: "The world tells us that happiness comes from wealth, status, and achievement. But Jesus offers something deeper — a purpose that money can't buy and circumstances can't take away. True fulfillment comes from knowing why you were created.",
    bibleVerse: "What good is it for someone to gain the whole world, yet forfeit their soul?",
    bibleRef: "Mark 8:36",
    reflection: "Have you ever achieved something you wanted and still felt empty?",
    xp: 25,
    type: "lesson",
  },
  {
    id: "0-3",
    levelId: 0,
    order: 3,
    title: "What People Truly Seek in Life",
    description: "At the deepest level, every person is searching for love, meaning, and belonging. These longings point us toward something beyond ourselves — toward the God who created us to know Him.",
    bibleVerse: "You have made us for yourself, O Lord, and our hearts are restless until they rest in you.",
    bibleRef: "St. Augustine",
    reflection: "What are you truly searching for in life?",
    xp: 25,
    type: "lesson",
  },
  {
    id: "0-4",
    levelId: 0,
    order: 4,
    title: "What Do You Really Want for Your Life?",
    question: "Imagine you could have anything. Which path speaks most to your heart?",
    options: [
      {
        label: "A",
        text: "Inner peace and spiritual connection",
        description: "You value a deep relationship with God and lasting peace that goes beyond circumstances. You sense there's more to life than what you can see.",
      },
      {
        label: "B",
        text: "Balance between faith and personal goals",
        description: "You want to honor God while also pursuing your dreams. You believe faith and ambition can work together for a meaningful life.",
      },
      {
        label: "C",
        text: "Freedom, success, and enjoying life",
        description: "You value personal achievement and happiness. You want a life full of experiences, growth, and the freedom to enjoy what you've earned.",
      },
    ],
    xp: 25,
    type: "quiz",
  },
  // Level 1
  {
    id: "1-1",
    levelId: 1,
    order: 1,
    title: "The Plan of Salvation",
    description: "God's plan of salvation is simple but profound: He loves us, we've all fallen short, Jesus paid the price, and we receive salvation by faith. It's a gift — not something we earn, but something we receive with open hands.",
    bibleVerse: "For it is by grace you have been saved, through faith — and this is not from yourselves, it is the gift of God.",
    bibleRef: "Ephesians 2:8",
    reflection: "How does it feel to know that salvation is a gift, not something you need to earn?",
    videoUrl: "https://www.youtube.com/embed/OwuElfMiKBs",
    xp: 40,
    type: "lesson",
  },
  {
    id: "1-2",
    levelId: 1,
    order: 2,
    title: "Who Jesus Is",
    description: "Jesus is not just a historical figure or a good teacher — He is God in human form. He came to show us what God is like, to live a perfect life, and to give His life so we could be forgiven and made new.",
    bibleVerse: "Jesus answered, 'I am the way and the truth and the life. No one comes to the Father except through me.'",
    bibleRef: "John 14:6",
    reflection: "Before today, who did you think Jesus was?",
    xp: 40,
    type: "lesson",
  },
  {
    id: "1-3",
    levelId: 1,
    order: 3,
    title: "What Sin Means",
    description: "Sin isn't just about breaking rules — it's anything that separates us from God. It's the gap between who we are and who God made us to be. The good news is that Jesus bridges that gap.",
    bibleVerse: "For all have sinned and fall short of the glory of God.",
    bibleRef: "Romans 3:23",
    reflection: "Is there anything in your life that you feel separates you from God?",
    xp: 40,
    type: "lesson",
  },
  {
    id: "1-4",
    levelId: 1,
    order: 4,
    title: "What It Means to Be Born Again",
    description: "Being born again means starting fresh — receiving a new spiritual life through Jesus. Just as you were physically born, God offers a spiritual rebirth that transforms your identity, purpose, and future.",
    bibleVerse: "Jesus replied, 'Very truly I tell you, no one can see the kingdom of God unless they are born again.'",
    bibleRef: "John 3:3",
    reflection: "What would it mean for you to start completely fresh?",
    xp: 40,
    type: "lesson",
  },
  {
    id: "1-5",
    levelId: 1,
    order: 5,
    title: "Beginning a Relationship with God",
    description: "A relationship with God begins with a simple conversation — prayer. You don't need fancy words or perfect behavior. God meets you right where you are and invites you to walk with Him daily.",
    bibleVerse: "Come near to God and he will come near to you.",
    bibleRef: "James 4:8",
    reflection: "If you could say one thing to God right now, what would it be?",
    xp: 40,
    type: "lesson",
  },
  // Level 2
  {
    id: "2-1",
    levelId: 2,
    order: 1,
    title: "How to Pray",
    description: "Prayer is simply talking to God. There's no perfect formula — just honesty, gratitude, and trust. Start by telling God what's on your heart, thanking Him for His blessings, and asking for His guidance.",
    bibleVerse: "Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God.",
    bibleRef: "Philippians 4:6",
    reflection: "What is one thing you'd like to talk to God about today?",
    xp: 50,
    type: "lesson",
  },
  {
    id: "2-2",
    levelId: 2,
    order: 2,
    title: "How to Read the Bible",
    description: "The Bible is God's letter to you. Start with small portions — a few verses a day. Read slowly, think about what it means, and ask God to help you understand. The Gospel of John is a great place to begin.",
    bibleVerse: "Your word is a lamp for my feet, a light on my path.",
    bibleRef: "Psalm 119:105",
    reflection: "Have you ever read any part of the Bible? What stood out?",
    xp: 50,
    type: "lesson",
  },
  {
    id: "2-3",
    levelId: 2,
    order: 3,
    title: "Understanding Scripture",
    description: "Understanding the Bible takes time and patience. Consider the context, who wrote it, and who it was written for. Let the Holy Spirit guide your reading, and don't be afraid to ask questions.",
    bibleVerse: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness.",
    bibleRef: "2 Timothy 3:16",
    reflection: "What question do you have about the Bible right now?",
    xp: 50,
    type: "lesson",
  },
  {
    id: "2-4",
    levelId: 2,
    order: 4,
    title: "Creating a Spiritual Journal",
    description: "A spiritual journal is a place to record your thoughts, prayers, and what God is teaching you. Writing helps you process your spiritual journey and notice patterns of growth and answered prayers.",
    bibleVerse: "Then the Lord replied: 'Write down the revelation and make it plain on tablets so that a herald may run with it.'",
    bibleRef: "Habakkuk 2:2",
    reflection: "What would you write in your first journal entry?",
    xp: 50,
    type: "lesson",
  },
  {
    id: "2-5",
    levelId: 2,
    order: 5,
    title: "Listening to God",
    description: "God speaks through His Word, through prayer, through other believers, and through the quiet voice of His Spirit. Learning to listen is one of the most beautiful parts of the Christian life.",
    bibleVerse: "Be still, and know that I am God.",
    bibleRef: "Psalm 46:10",
    reflection: "When was a time you felt a sense of peace or guidance that you couldn't explain?",
    xp: 50,
    type: "lesson",
  },
  // Level 3
  {
    id: "3-1",
    levelId: 3,
    order: 1,
    title: "Facing Temptation",
    description: "Temptation is part of life, but it doesn't define you. Jesus Himself was tempted and overcame. Through His strength, prayer, and wisdom from Scripture, you can resist temptation and grow stronger.",
    bibleVerse: "No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear.",
    bibleRef: "1 Corinthians 10:13",
    reflection: "What temptation do you find most challenging?",
    xp: 60,
    type: "lesson",
  },
  {
    id: "3-2",
    levelId: 3,
    order: 2,
    title: "Faith in Everyday Life",
    description: "Faith isn't just for Sundays — it's for Monday mornings, difficult conversations, and ordinary moments. When you bring God into every part of your day, everything becomes an opportunity to grow.",
    bibleVerse: "So whether you eat or drink or whatever you do, do it all for the glory of God.",
    bibleRef: "1 Corinthians 10:31",
    reflection: "How can you include God in one ordinary moment today?",
    xp: 60,
    type: "lesson",
  },
  {
    id: "3-3",
    levelId: 3,
    order: 3,
    title: "Family and Faith",
    description: "Faith begins at home. Whether your family shares your beliefs or not, you can be a light through love, patience, and example. God calls us to build homes grounded in His love.",
    bibleVerse: "But as for me and my household, we will serve the Lord.",
    bibleRef: "Joshua 24:15",
    reflection: "How does your faith affect your family relationships?",
    xp: 60,
    type: "lesson",
  },
  {
    id: "3-4",
    levelId: 3,
    order: 4,
    title: "Christian Community",
    description: "You were never meant to walk this journey alone. Christian community — whether a small group, a church, or a few friends — provides encouragement, accountability, and a place to belong.",
    bibleVerse: "For where two or three gather in my name, there am I with them.",
    bibleRef: "Matthew 18:20",
    reflection: "Do you have people in your life who encourage your faith?",
    xp: 60,
    type: "lesson",
  },
  {
    id: "3-5",
    levelId: 3,
    order: 5,
    title: "Sharing Your Faith",
    description: "Sharing your faith doesn't mean having all the answers — it means sharing what God has done in your life. Your story is powerful, and someone needs to hear it.",
    bibleVerse: "Always be prepared to give an answer to everyone who asks you to give the reason for the hope that you have.",
    bibleRef: "1 Peter 3:15",
    reflection: "If someone asked you why you believe, what would you say?",
    xp: 60,
    type: "lesson",
  },
];

export const dailyVerses = [
  { verse: "The Lord is my shepherd, I lack nothing.", ref: "Psalm 23:1" },
  { verse: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { verse: "I can do all this through him who gives me strength.", ref: "Philippians 4:13" },
  { verse: "Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
  { verse: "The Lord is close to the brokenhearted and saves those who are crushed in spirit.", ref: "Psalm 34:18" },
  { verse: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you.", ref: "Jeremiah 29:11" },
  { verse: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7" },
];

export const dailyChallenges = [
  "Take 5 minutes to pray and thank God for 3 things in your life.",
  "Read John 1:1-14 slowly and write down what stands out to you.",
  "Send an encouraging message to someone you care about.",
  "Spend 2 minutes in silence, simply being still before God.",
  "Write a short prayer in your journal about something on your heart.",
  "Read Psalm 23 and reflect on what it means for God to be your shepherd.",
  "Think about one way you can show kindness to someone today.",
];

export const readingPlans = [
  {
    id: "john",
    title: "Gospel of John",
    description: "Discover who Jesus is through the eyes of His closest friend.",
    chapters: 21,
    icon: "📖",
  },
  {
    id: "mark",
    title: "Gospel of Mark",
    description: "A fast-paced account of Jesus' life and ministry.",
    chapters: 16,
    icon: "📕",
  },
  {
    id: "psalms",
    title: "Psalms",
    description: "Songs and prayers that express every human emotion before God.",
    chapters: 150,
    icon: "🎵",
  },
  {
    id: "proverbs",
    title: "Proverbs",
    description: "Practical wisdom for everyday life.",
    chapters: 31,
    icon: "💡",
  },
];

export const badges = [
  { id: "first-prayer", title: "First Prayer", description: "Wrote your first prayer", icon: "🙏", condition: "journal_prayer" },
  { id: "first-reflection", title: "First Reflection", description: "Completed your first reflection", icon: "✍️", condition: "journal_reflection" },
  { id: "first-lesson", title: "First Lesson", description: "Completed your first lesson", icon: "📘", condition: "lesson_1" },
  { id: "week-streak", title: "7-Day Journey", description: "Used the app for 7 days", icon: "🔥", condition: "streak_7" },
  { id: "level-1", title: "Faithful Beginner", description: "Completed Level 0", icon: "🌱", condition: "level_0_complete" },
  { id: "level-2", title: "Growing in Faith", description: "Completed Level 1", icon: "🌿", condition: "level_1_complete" },
  { id: "bible-reader", title: "Bible Reader", description: "Started a reading plan", icon: "📖", condition: "reading_plan" },
  { id: "five-lessons", title: "Dedicated Learner", description: "Completed 5 lessons", icon: "⭐", condition: "lesson_5" },
];
