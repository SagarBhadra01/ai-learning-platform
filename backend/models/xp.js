const mongoose = require('mongoose');

const xpSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  totalXP: {
    type: Number,
    default: 0,
    min: 0
  },
  currentLevel: {
    type: Number,
    default: 1,
    min: 1
  },
  xpToNextLevel: {
    type: Number,
    default: 100
  },
  streak: {
    current: {
      type: Number,
      default: 0,
      min: 0
    },
    longest: {
      type: Number,
      default: 0,
      min: 0
    },
    lastActivity: {
      type: Date,
      default: null
    }
  },
  achievements: [{
    name: {
      type: String,
      required: true
    },
    description: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    xpReward: {
      type: Number,
      default: 0
    }
  }],
  dailyXP: {
    date: {
      type: Date,
      default: () => new Date().setHours(0, 0, 0, 0)
    },
    earned: {
      type: Number,
      default: 0
    }
  },
  weeklyXP: {
    weekStart: {
      type: Date,
      default: () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        return new Date(now.setDate(diff)).setHours(0, 0, 0, 0);
      }
    },
    earned: {
      type: Number,
      default: 0
    }
  },
  xpHistory: [{
    amount: {
      type: Number,
      required: true
    },
    source: {
      type: String,
      required: true,
      enum: ['lesson_completion', 'quiz_completion', 'course_completion', 'streak_bonus', 'achievement', 'daily_bonus']
    },
    sourceId: String, // ID of the lesson, quiz, or course
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Pre-save hook to ensure proper initialization
xpSchema.pre('save', function(next) {
  // Only run this for new documents
  if (this.isNew) {
    // Ensure xpToNextLevel is calculated correctly for new users
    this.xpToNextLevel = this.calculateXPForLevel(this.currentLevel + 1) - this.totalXP;
  }
  next();
});

// Calculate XP required for next level (exponential growth)
xpSchema.methods.calculateXPForLevel = function(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

// Add XP and handle level ups
xpSchema.methods.addXP = function(amount, source, sourceId = null) {
  this.totalXP += amount;
  
  // Add to XP history
  this.xpHistory.push({
    amount,
    source,
    sourceId
  });
  
  // Update daily XP
  const today = new Date().setHours(0, 0, 0, 0);
  if (this.dailyXP.date.getTime() !== today) {
    this.dailyXP.date = new Date(today);
    this.dailyXP.earned = 0;
  }
  this.dailyXP.earned += amount;
  
  // Update weekly XP
  const now = new Date();
  const dayOfWeek = now.getDay();
  const weekStart = new Date(now.setDate(now.getDate() - dayOfWeek)).setHours(0, 0, 0, 0);
  if (this.weeklyXP.weekStart.getTime() !== weekStart) {
    this.weeklyXP.weekStart = new Date(weekStart);
    this.weeklyXP.earned = 0;
  }
  this.weeklyXP.earned += amount;
  
  // Check for level up
  let leveledUp = false;
  while (this.totalXP >= this.calculateXPForLevel(this.currentLevel + 1)) {
    this.currentLevel++;
    leveledUp = true;
  }
  
  // Update XP to next level
  this.xpToNextLevel = this.calculateXPForLevel(this.currentLevel + 1) - this.totalXP;
  
  return { leveledUp, newLevel: this.currentLevel };
};

// Update streak
xpSchema.methods.updateStreak = function() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActivity = this.streak.lastActivity ? 
    new Date(this.streak.lastActivity.getFullYear(), this.streak.lastActivity.getMonth(), this.streak.lastActivity.getDate()) : 
    null;
  
  if (!lastActivity) {
    // First activity
    this.streak.current = 1;
    this.streak.lastActivity = now;
  } else {
    const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      // Same day, no change to streak
      return false;
    } else if (daysDiff === 1) {
      // Consecutive day, increment streak
      this.streak.current++;
      this.streak.lastActivity = now;
      
      // Update longest streak if needed
      if (this.streak.current > this.streak.longest) {
        this.streak.longest = this.streak.current;
      }
      
      return true; // Streak continued
    } else {
      // Streak broken
      this.streak.current = 1;
      this.streak.lastActivity = now;
      return false;
    }
  }
  
  return true; // New streak started
};

// Add achievement
xpSchema.methods.addAchievement = function(name, description, xpReward = 0) {
  // Check if achievement already exists
  const existingAchievement = this.achievements.find(achievement => achievement.name === name);
  if (existingAchievement) {
    return false; // Achievement already earned
  }
  
  this.achievements.push({
    name,
    description,
    xpReward
  });
  
  // Add XP reward if any
  if (xpReward > 0) {
    this.addXP(xpReward, 'achievement');
  }
  
  return true; // Achievement added
};

// Get user's rank based on total XP (static method)
xpSchema.statics.getUserRank = async function(userId) {
  const userXP = await this.findOne({ userId });
  if (!userXP) return null;
  
  const rank = await this.countDocuments({ totalXP: { $gt: userXP.totalXP } }) + 1;
  return rank;
};

// Get leaderboard (static method)
xpSchema.statics.getLeaderboard = async function(limit = 10) {
  return await this.find({})
    .sort({ totalXP: -1 })
    .limit(limit)
    .select('userId totalXP currentLevel streak.current streak.longest');
};

const XP = mongoose.model('XP', xpSchema);

module.exports = XP;