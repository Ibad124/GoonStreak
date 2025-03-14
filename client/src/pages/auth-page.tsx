import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { motion, MotionProps, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { Loader2, Lock, User, ArrowRight, Sparkles } from "lucide-react";

const formVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    y: -50,
    transition: {
      duration: 0.2
    }
  }
};

const inputContainerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  })
};

const buttonVariants = {
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2,
      yoyo: Infinity
    }
  },
  tap: {
    scale: 0.95
  }
};

const MotionButton = motion(Button);

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();

  const loginForm = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      password: "",
      isAnonymous: false,
      showOnLeaderboard: true,
    },
  });

  if (user) {
    return <Redirect to="/onboarding" />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="min-h-screen flex flex-col md:flex-row relative z-10">
        {/* Form Section */}
        <motion.div 
          className="flex-1 flex items-center justify-center p-4 md:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="w-full max-w-md p-6 backdrop-blur-xl bg-white/90 shadow-xl shadow-blue-900/5 border-zinc-200/50">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative overflow-hidden group"
                >
                  <span className="relative z-10">Login</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600"
                    initial={false}
                    animate={{ 
                      scale: 0,
                      opacity: 0
                    }}
                    whileHover={{ 
                      scale: 1,
                      opacity: 0.1
                    }}
                  />
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative overflow-hidden group"
                >
                  <span className="relative z-10">Register</span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600"
                    initial={false}
                    animate={{ 
                      scale: 0,
                      opacity: 0
                    }}
                    whileHover={{ 
                      scale: 1,
                      opacity: 0.1
                    }}
                  />
                </TabsTrigger>
              </TabsList>

              <AnimatePresence mode="wait">
                <TabsContent value="login">
                  <motion.div
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Form {...loginForm}>
                      <form
                        onSubmit={loginForm.handleSubmit((data) => loginMutation.mutate(data))}
                        className="space-y-6"
                      >
                        <motion.div
                          variants={inputContainerVariants}
                          custom={0}
                          initial="hidden"
                          animate="visible"
                        >
                          <FormField
                            control={loginForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative group">
                                    <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                                    <Input
                                      placeholder="Username"
                                      {...field}
                                      className="h-12 pl-10 transition-all duration-300 bg-white/50 backdrop-blur-sm border-zinc-200/50 focus:bg-white/80"
                                    />
                                    <motion.div
                                      className="absolute inset-0 rounded-md ring-2 ring-primary/50 pointer-events-none"
                                      initial={{ opacity: 0 }}
                                      whileFocus={{ opacity: 1 }}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          variants={inputContainerVariants}
                          custom={1}
                          initial="hidden"
                          animate="visible"
                        >
                          <FormField
                            control={loginForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative group">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                                    <Input
                                      type="password"
                                      placeholder="Password"
                                      {...field}
                                      className="h-12 pl-10 transition-all duration-300 bg-white/50 backdrop-blur-sm border-zinc-200/50 focus:bg-white/80"
                                    />
                                    <motion.div
                                      className="absolute inset-0 rounded-md ring-2 ring-primary/50 pointer-events-none"
                                      initial={{ opacity: 0 }}
                                      whileFocus={{ opacity: 1 }}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          variants={inputContainerVariants}
                          custom={2}
                          initial="hidden"
                          animate="visible"
                        >
                          <MotionButton
                            type="submit"
                            className="w-full h-12 text-lg relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            disabled={loginMutation.isPending}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {loginMutation.isPending ? (
                              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                            ) : (
                              <motion.div className="flex items-center justify-center gap-2">
                                <span>Login</span>
                                <motion.div
                                  animate={{ x: [0, 5, 0] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <ArrowRight className="h-5 w-5" />
                                </motion.div>
                              </motion.div>
                            )}
                          </MotionButton>
                        </motion.div>
                      </form>
                    </Form>
                  </motion.div>
                </TabsContent>

                <TabsContent value="register">
                  <motion.div
                    variants={formVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <Form {...registerForm}>
                      <form
                        onSubmit={registerForm.handleSubmit((data) => registerMutation.mutate(data))}
                        className="space-y-6"
                      >
                        <motion.div
                          variants={inputContainerVariants}
                          custom={0}
                          initial="hidden"
                          animate="visible"
                        >
                          <FormField
                            control={registerForm.control}
                            name="username"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative group">
                                    <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                                    <Input
                                      placeholder="Choose a username"
                                      {...field}
                                      className="h-12 pl-10 transition-all duration-300 bg-white/50 backdrop-blur-sm border-zinc-200/50 focus:bg-white/80"
                                    />
                                    <motion.div
                                      className="absolute inset-0 rounded-md ring-2 ring-primary/50 pointer-events-none"
                                      initial={{ opacity: 0 }}
                                      whileFocus={{ opacity: 1 }}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          variants={inputContainerVariants}
                          custom={1}
                          initial="hidden"
                          animate="visible"
                        >
                          <FormField
                            control={registerForm.control}
                            name="password"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative group">
                                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
                                    <Input
                                      type="password"
                                      placeholder="Create a password"
                                      {...field}
                                      className="h-12 pl-10 transition-all duration-300 bg-white/50 backdrop-blur-sm border-zinc-200/50 focus:bg-white/80"
                                    />
                                    <motion.div
                                      className="absolute inset-0 rounded-md ring-2 ring-primary/50 pointer-events-none"
                                      initial={{ opacity: 0 }}
                                      whileFocus={{ opacity: 1 }}
                                    />
                                  </div>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </motion.div>

                        <motion.div
                          variants={inputContainerVariants}
                          custom={2}
                          initial="hidden"
                          animate="visible"
                        >
                          <MotionButton
                            type="submit"
                            className="w-full h-12 text-lg relative overflow-hidden bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            disabled={registerMutation.isPending}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            {registerMutation.isPending ? (
                              <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                            ) : (
                              <motion.div className="flex items-center justify-center gap-2">
                                <Sparkles className="h-5 w-5" />
                                <span>Start Your Journey</span>
                                <motion.div
                                  animate={{ x: [0, 5, 0] }}
                                  transition={{ duration: 1, repeat: Infinity }}
                                >
                                  <ArrowRight className="h-5 w-5" />
                                </motion.div>
                              </motion.div>
                            )}
                          </MotionButton>
                        </motion.div>
                      </form>
                    </Form>
                  </motion.div>
                </TabsContent>
              </AnimatePresence>
            </Tabs>
          </Card>
        </motion.div>

        {/* Hero Section */}
        <motion.div 
          className="bg-primary hidden md:flex flex-1 items-center justify-center p-12 relative overflow-hidden"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Animated background patterns */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20" />
            <motion.div
              className="absolute top-0 left-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.2, 0.3],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.3, 0.2],
              }}
              transition={{ duration: 4, repeat: Infinity, delay: 2 }}
            />
          </motion.div>

          <div className="max-w-lg relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <motion.h1 
                className="text-5xl font-bold mb-6 text-primary-foreground"
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Welcome to Goon Streak
              </motion.h1>
              <motion.p 
                className="text-xl leading-relaxed text-primary-foreground/90"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                Transform your daily habits into achievements. Track streaks, earn rewards, 
                and join a community of motivated individuals on their journey to success.
              </motion.p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}