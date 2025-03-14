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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Redirect } from "wouter";
import { Loader2, Lock, User, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

const inputVariants = {
  focus: { scale: 1.02, transition: { duration: 0.2 } },
  blur: { scale: 1, transition: { duration: 0.2 } }
};

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
    return <Redirect to="/onboarding/goals" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Form Section */}
      <motion.div 
        className="flex-1 flex items-center justify-center p-6 md:p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="w-full max-w-md p-6 backdrop-blur-xl bg-white/90 shadow-xl shadow-blue-900/5 border-zinc-200/50">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="login" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Login
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Register
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
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <motion.div
                                variants={inputVariants}
                                whileFocus="focus"
                                animate="blur"
                              >
                                <div className="relative">
                                  <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground/50" />
                                  <Input
                                    placeholder="Username"
                                    {...field}
                                    className="h-12 pl-10"
                                  />
                                </div>
                              </motion.div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <motion.div
                                variants={inputVariants}
                                whileFocus="focus"
                                animate="blur"
                              >
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground/50" />
                                  <Input
                                    type="password"
                                    placeholder="Password"
                                    {...field}
                                    className="h-12 pl-10"
                                  />
                                </div>
                              </motion.div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full h-12 text-lg relative group"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : (
                          <>
                            Login
                            <ArrowRight className="h-5 w-5 ml-2 inline-block transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
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
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <motion.div
                                variants={inputVariants}
                                whileFocus="focus"
                                animate="blur"
                              >
                                <div className="relative">
                                  <User className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground/50" />
                                  <Input
                                    placeholder="Choose a username"
                                    {...field}
                                    className="h-12 pl-10"
                                  />
                                </div>
                              </motion.div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <motion.div
                                variants={inputVariants}
                                whileFocus="focus"
                                animate="blur"
                              >
                                <div className="relative">
                                  <Lock className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground/50" />
                                  <Input
                                    type="password"
                                    placeholder="Create a password"
                                    {...field}
                                    className="h-12 pl-10"
                                  />
                                </div>
                              </motion.div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full h-12 text-lg relative group"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                        ) : (
                          <>
                            Get Started
                            <ArrowRight className="h-5 w-5 ml-2 inline-block transition-transform group-hover:translate-x-1" />
                          </>
                        )}
                      </Button>
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
        className="bg-primary hidden md:flex flex-1 items-center justify-center p-12"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h1 className="text-5xl font-bold mb-6 text-primary-foreground">
              Welcome to Goon Streak
            </h1>
            <p className="text-xl leading-relaxed text-primary-foreground/90">
              Transform your daily habits into achievements. Track streaks, earn rewards, 
              and join a community of motivated individuals on their journey to success.
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}