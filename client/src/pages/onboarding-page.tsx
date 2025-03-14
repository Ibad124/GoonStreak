import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  User,
  Users,
  Trophy,
  Target,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Ghost,
  Crown,
  Medal,
  Brain,
  Heart,
  Coffee,
  Sun,
  Moon,
  Zap,
} from "lucide-react";
import { PageTransition } from "@/components/PageTransition";

// Enhanced typing animation for messages
const TypedMessage = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = React.useState("");

  React.useEffect(() => {
    let index = 0;
    setDisplayText("");

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayText(prev => prev + text[index]);
        index++;
      } else {
        clearInterval(timer);
      }
    }, 30);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {displayText}
    </motion.span>
  );
};

// Enhanced background effects based on character style
const BackgroundEffects = ({ style = "default" }) => {
  const variants = {
    solo: {
      className: "absolute inset-0 bg-gradient-to-br from-red-900/20 via-orange-900/10 to-red-900/20",
      patterns: (
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-red-500/10 w-1 h-20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 0.5, 0.2],
                height: ["20px", "40px", "20px"],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </motion.div>
      ),
    },
    competitive: {
      className: "absolute inset-0 bg-gradient-to-br from-pink-400/20 via-purple-400/10 to-pink-400/20",
      patterns: (
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-pink-500/10 rounded-full"
              style={{
                width: "100px",
                height: "100px",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: Math.random() * 3,
              }}
            />
          ))}
        </motion.div>
      ),
    },
    hardcore: {
      className: "absolute inset-0 bg-gradient-to-br from-purple-900/30 via-red-900/20 to-purple-900/30",
      patterns: (
        <motion.div
          className="absolute inset-0 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-red-500/10"
              style={{
                width: "200px",
                height: "200px",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                borderRadius: "40%",
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
            />
          ))}
        </motion.div>
      ),
    },
    default: {
      className: "absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50",
      patterns: null,
    },
  };

  const variant = variants[style] || variants.default;

  return (
    <>
      <div className={variant.className} />
      {variant.patterns}
    </>
  );
};

// Guide character variants
const characterVariants = {
  default: {
    color: "from-blue-400 to-purple-500",
    messages: {
      welcome: "Hey there! Let's get to know you better! 👋",
      timePreference: "When do you feel most energized? Pick your power hours! ⚡",
      intensity: "How hard do you want to push yourself? Choose your intensity! 💪",
      social: "Last step! Let's figure out your social style! 🌟",
    }
  },
  solo: {
    color: "from-red-500 to-orange-600",
    messages: {
      welcome: "GREETINGS, MORTAL. I AM GOONBOT 9000. YOU HAVE CHOSEN THE PATH OF SOLITUDE. INITIALIZING TRAINING PROTOCOL... 🤖",
      timePreference: "ANALYZING OPTIMAL PERFORMANCE WINDOWS. SELECT YOUR PRIME OPERATION HOURS! ⚡",
      intensity: "CALIBRATING CHALLENGE PARAMETERS. SET YOUR POWER LEVEL! 💪",
      social: "CONFIGURING SOCIAL PROTOCOLS. DETERMINE YOUR INTERACTION MATRIX! 🔧",
    }
  },
  competitive: {
    color: "from-pink-400 to-purple-500",
    messages: {
      welcome: "Heya streaker! I'm Goonette, and I'm super excited to be your streak buddy! Let's make this fun! 💖",
      timePreference: "When are you at your absolute best? Choose your power hours! ✨",
      intensity: "Time to spice things up! How challenging should we make this? 🔥",
      social: "Last but not least, let's see how social you wanna be! No pressure! 😘",
    }
  },
  hardcore: {
    color: "from-purple-900 to-red-900",
    messages: {
      welcome: "Ah, a seeker of ultimate power enters my domain. I am The Temptress, and I shall guide your journey... 😈",
      timePreference: "Choose the hours when your power peaks, mortal. Choose wisely... ⏳",
      intensity: "Now, show me how far you're willing to go. What intensity beckons you? 🔥",
      social: "The final choice awaits. How shall others witness your ascension? 👑",
    }
  }
};

// Enhanced GuideCharacter component
const GuideCharacter = ({ emotion = "happy", style = "default" }) => {
  const variant = characterVariants[style];

  return (
    <motion.div
      className="absolute top-4 right-4 w-24 h-24 md:w-32 md:h-32"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div className="relative">
        {/* Character base */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${variant.color} rounded-full`}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Eyes */}
        <motion.div
          className={`absolute top-1/3 left-1/4 w-3 h-3 bg-white rounded-full ${
            style === 'hardcore' ? 'bg-red-500' : 'bg-white'
          }`}
          animate={style === 'solo' ? {
            opacity: [1, 0, 1],
            scale: [1, 1.2, 1],
          } : {
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: style === 'solo' ? 2 : 1, repeat: Infinity }}
        />
        <motion.div
          className={`absolute top-1/3 right-1/4 w-3 h-3 bg-white rounded-full ${
            style === 'hardcore' ? 'bg-red-500' : 'bg-white'
          }`}
          animate={style === 'solo' ? {
            opacity: [1, 0, 1],
            scale: [1, 1.2, 1],
          } : {
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: style === 'solo' ? 2 : 1, repeat: Infinity }}
        />

        {/* Mouth */}
        <motion.div
          className={`absolute bottom-1/3 left-1/2 -translate-x-1/2 w-8 h-2 bg-white rounded-full ${
            style === 'competitive' ? 'h-3' : 'h-2'
          } ${style === 'hardcore' ? 'bg-red-500' : 'bg-white'}`}
          animate={
            style === 'competitive'
              ? {
                  scaleX: [1, 1.2, 1],
                  scaleY: [1, 1.5, 1],
                  rotate: [0, 5, 0],
                }
              : style === 'solo'
              ? {
                  scaleX: [1, 1.1, 1],
                  rotate: 0,
                }
              : {
                  scaleX: [1, 1.2, 1],
                  rotate: [0, 5, 0],
                }
          }
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Special effects based on character type */}
        {style === 'solo' && (
          <motion.div
            className="absolute inset-0 border-2 border-red-500 rounded-full"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        {style === 'competitive' && (
          <motion.div
            className="absolute -inset-2 opacity-50"
            animate={{
              rotate: [0, 360],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-pink-300 rounded-full"
                style={{
                  top: '50%',
                  left: '50%',
                  transform: `rotate(${i * 45}deg) translateY(-12px)`,
                }}
              />
            ))}
          </motion.div>
        )}
        {style === 'hardcore' && (
          <motion.div
            className="absolute -inset-4 opacity-30"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3],
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <div className="absolute inset-0 bg-red-500 rounded-full filter blur-xl" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

const goonStyles = [
  {
    id: "solo",
    title: "Solo Tracker",
    description: "I go solo, just tracking my progress.",
    icon: Ghost,
    color: "from-purple-500 to-indigo-500",
    greeting: "A lone wolf! I respect that. 🐺"
  },
  {
    id: "competitive",
    title: "Competitive Spirit",
    description: "I love competing with friends!",
    icon: Trophy,
    color: "from-yellow-500 to-orange-500",
    greeting: "Oh, a challenger appears! 🏆"
  },
  {
    id: "hardcore",
    title: "Record Breaker",
    description: "I want to break records & hit insane streaks!",
    icon: Crown,
    color: "from-red-500 to-pink-500",
    greeting: "Now that's what I call dedication! 👑"
  }
];

const timePreferences = [
  {
    id: "morning",
    title: "Early Bird",
    description: "I'm most productive in the morning",
    icon: Sun,
    color: "from-yellow-400 to-orange-500"
  },
  {
    id: "afternoon",
    title: "Midday Master",
    description: "Afternoon is my power hour",
    icon: Coffee,
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "night",
    title: "Night Owl",
    description: "I come alive at night",
    icon: Moon,
    color: "from-blue-600 to-indigo-700"
  }
];

const intensityLevels = [
  {
    id: "casual",
    title: "Steady Pace",
    description: "I like to take it easy and build consistently",
    icon: Target,
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "medium",
    title: "Balanced",
    description: "Mix of challenge and sustainability",
    icon: Zap,
    color: "from-yellow-500 to-orange-500"
  },
  {
    id: "intense",
    title: "Maximum Effort",
    description: "Push to the limit every time",
    icon: Trophy,
    color: "from-red-500 to-pink-500"
  }
];

const socialPreferences = [
  {
    id: "solo",
    title: "Solo Mode",
    description: "No leaderboards, just personal stats",
    icon: User,
    color: "from-purple-500 to-indigo-500"
  },
  {
    id: "friends",
    title: "Friends Mode",
    description: "Compete against friends!",
    icon: Users,
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "global",
    title: "Global Mode",
    description: "See top streakers worldwide",
    icon: Trophy,
    color: "from-yellow-500 to-orange-500"
  }
];

const getGuideMessage = (step: number, goonStyle: string) => {
  const variant = characterVariants[goonStyle || 'default'];

  switch(step) {
    case 1:
      return goonStyle ? goonStyles.find(style => style.id === goonStyle)?.greeting : variant.messages.welcome;
    case 2:
      return variant.messages.timePreference;
    case 3:
      return variant.messages.intensity;
    case 4:
      return variant.messages.social;
    default:
      return "Ready to start your journey? Let's go! 🚀";
  }
};

const getFinalButtonText = (style: string) => {
  switch(style) {
    case 'solo':
      return "INITIALIZE GOONING PROTOCOL... 🤖";
    case 'competitive':
      return "Let's Get This Party Started! 💖";
    case 'hardcore':
      return "Embrace Your Dark Destiny... 😈";
    default:
      return "Begin Your Journey! 🚀";
  }
};

const OnboardingPage = () => {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const [goonStyle, setGoonStyle] = useState("");
  const [timePreference, setTimePreference] = useState("");
  const [intensityLevel, setIntensityLevel] = useState("");
  const [socialMode, setSocialMode] = useState("");
  const [guideEmotion, setGuideEmotion] = useState("happy");
  const [showTransition, setShowTransition] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const savePreferencesMutation = useMutation({
    mutationFn: async (preferences: any) => {
      const res = await apiRequest("POST", "/api/user/preferences", preferences);
      return res.json();
    },
    onSuccess: () => {
      // Invalidate queries to ensure home page gets fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user/preferences"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      // Show the transition animation
      setShowTransition(true);
    },
  });

  const handleNext = () => {
    setDirection(1);
    setStep(prev => prev + 1);
    setGuideEmotion("happy");
  };

  const handleBack = () => {
    setDirection(-1);
    setStep(prev => prev - 1);
    setGuideEmotion("happy");
  };

  const handleComplete = () => {
    savePreferencesMutation.mutate({
      goonStyle,
      timePreference,
      intensityLevel,
      socialMode
    });
  };

  const handleTransitionComplete = () => {
    // Ensure all animations are complete before navigation
    setTimeout(() => {
      setLocation("/");
    }, 100); // Small delay to ensure smooth transition
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundEffects style={goonStyle} />

      <PageTransition
        isVisible={showTransition}
        onComplete={handleTransitionComplete}
      >
        <motion.div 
          className="text-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <motion.p className="text-4xl font-bold text-white">
            {goonStyle === 'solo' ? "SYSTEMS ACTIVATED" :
             goonStyle === 'competitive' ? "Ready to Rock!" :
             goonStyle === 'hardcore' ? "Darkness Embraces You..." :
             "Your Journey Begins!"}
          </motion.p>
          <motion.p 
            className="text-xl text-white/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            {goonStyle === 'solo' ? "PREPARING TRAINING PROTOCOLS..." :
             goonStyle === 'competitive' ? "Time to show them what you've got!" :
             goonStyle === 'hardcore' ? "Your ascension awaits..." :
             "Let's make some magic happen!"}
          </motion.p>
        </motion.div>
      </PageTransition>

      <div className="max-w-4xl mx-auto relative py-12 px-4">
        <GuideCharacter emotion={guideEmotion} style={goonStyle || 'default'} />

        <motion.div
          className="text-xl font-medium text-primary mb-8 p-6 bg-white/50 backdrop-blur-sm rounded-lg shadow-sm border border-white/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          key={step}
        >
          <TypedMessage text={getGuideMessage(step, goonStyle)} />
        </motion.div>

        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold mb-4">Welcome Aboard! 🎉</h1>
                <p className="text-xl text-muted-foreground">
                  First, tell us how you like to track your progress
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {goonStyles.map((style, index) => (
                  <motion.div
                    key={style.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-all duration-300 ${
                        goonStyle === style.id
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => {
                        setGoonStyle(style.id);
                        setGuideEmotion("happy");
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${style.color}`}>
                          <style.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{style.title}</h3>
                          <p className="text-muted-foreground">{style.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-8 flex justify-end"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={!goonStyle}
                  className="group"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold mb-4">Pick Your Power Hours ⚡</h1>
                <p className="text-xl text-muted-foreground">
                  When are you at your peak performance?
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {timePreferences.map((pref, index) => (
                  <motion.div
                    key={pref.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-all duration-300 ${
                        timePreference === pref.id
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => setTimePreference(pref.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${pref.color}`}>
                          <pref.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{pref.title}</h3>
                          <p className="text-muted-foreground">{pref.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-8 flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="group"
                >
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={!timePreference}
                  className="group"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold mb-4">Set Your Intensity 🔥</h1>
                <p className="text-xl text-muted-foreground">
                  How hard do you want to push yourself?
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {intensityLevels.map((level, index) => (
                  <motion.div
                    key={level.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-all duration-300 ${
                        intensityLevel === level.id
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => setIntensityLevel(level.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${level.color}`}>
                          <level.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{level.title}</h3>
                          <p className="text-muted-foreground">{level.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-8 flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="group"
                >
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={handleNext}
                  disabled={!intensityLevel}
                  className="group"
                >
                  Continue
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h1 className="text-4xl font-bold mb-4">Choose Your Community 🌟</h1>
                <p className="text-xl text-muted-foreground">
                  How would you like to connect with others?
                </p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                {socialPreferences.map((pref, index) => (
                  <motion.div
                    key={pref.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className={`p-6 cursor-pointer transition-all duration-300 ${
                        socialMode === pref.id
                          ? "ring-2 ring-primary ring-offset-2"
                          : "hover:shadow-lg"
                      }`}
                      onClick={() => setSocialMode(pref.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${pref.color}`}>
                          <pref.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{pref.title}</h3>
                          <p className="text-muted-foreground">{pref.description}</p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                className="mt-8 flex justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  className="group"
                >
                  <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translatex-1" />
                  Back
                </Button>
                <Button                  size="lg"
                  onClick={handleComplete}
                  disabled={!socialMode || savePreferencesMutation.isPending}
                  className="group"
                >
                  {savePreferencesMutation.isPending ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    </motion.div>
                  ) : (
                    <>
                      {getFinalButtonText(goonStyle)}
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </motion.div>
                    </>
                  )}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default OnboardingPage;