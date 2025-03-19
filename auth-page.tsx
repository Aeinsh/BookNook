import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, loginSchema } from "@shared/schema";
import { z } from "zod";
import { Eye, EyeOff, BookOpen, ArrowRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Redirect to home if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Login form setup
  const loginForm = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: z.infer<typeof insertUserSchema>) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left column - Welcome Content */}
      <div className="flex flex-col w-full md:w-1/2 p-8 md:p-16 justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-5xl font-black mb-6 text-black">
            Welcome to BookNook
          </h1>
          <p className="text-2xl text-black mb-12 leading-relaxed">
            Your enchanted gateway to literary adventures
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="feature-card">
              <div className="text-3xl mb-3">📚</div>
              <h3 className="text-xl font-bold mb-2 text-black">Endless Library</h3>
              <p className="text-black">Discover thousands of books across all genres</p>
            </div>

            <div className="feature-card">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-bold mb-2 text-black">Smart Goals</h3>
              <p className="text-black">Track your reading progress effortlessly</p>
            </div>

            <div className="feature-card">
              <div className="text-3xl mb-3">💫</div>
              <h3 className="text-xl font-bold mb-2 text-black">Personalized</h3>
              <p className="text-black">Get recommendations tailored to your taste</p>
            </div>

            <div className="feature-card">
              <div className="text-3xl mb-3">🌟</div>
              <h3 className="text-xl font-bold mb-2 text-black">Community</h3>
              <p className="text-black">Join readers worldwide in discussions</p>
            </div>
          </div>
        </div>
        <div className="w-full max-w-md mx-auto">
          <div className="flex items-center mb-8">
            <BookOpen className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-2" />
            <h1 className="text-2xl font-bold text-black">Book<span className="text-secondary-500">Nook</span></h1>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardContent className="pt-6">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your username" {...field} />
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
                            <div className="flex items-center justify-between">
                              <FormLabel>Password</FormLabel>
                              <a href="#" className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                                Forgot password?
                              </a>
                            </div>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showLoginPassword ? "text" : "password"}
                                  placeholder="••••••••" 
                                  {...field} 
                                />
                                <button 
                                  type="button"
                                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400" 
                                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                                >
                                  {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center space-x-2">
                        <Checkbox id="remember" />
                        <label
                          htmlFor="remember"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                        >
                          Remember me
                        </label>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Signing in..." : "Sign in"}
                      </Button>

                      <p className="text-xs text-center text-black mt-4">
                        By signing in, you'll access your saved reading history and personalized book recommendations.
                      </p>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardContent className="pt-6">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={registerForm.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="John" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={registerForm.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
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
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showRegisterPassword ? "text" : "password"}
                                  placeholder="••••••••" 
                                  {...field} 
                                />
                                <button 
                                  type="button"
                                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400" 
                                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                >
                                  {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </FormControl>
                            <p className="text-xs text-black mt-1">
                              8-12 characters, including uppercase, lowercase, number, special character
                            </p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="••••••••" 
                                  {...field} 
                                />
                                <button 
                                  type="button"
                                  className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400" 
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex items-center space-x-2">
                        <Checkbox id="terms" required />
                        <label
                          htmlFor="terms"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-black"
                        >
                          I agree to the <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">Terms of Service</a> and <a href="#" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">Privacy Policy</a>
                        </label>
                      </div>

                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                        <p className="text-sm text-black">
                          <strong>Your data will be saved!</strong> Registration creates a permanent account that stores your reading history, bookmarks, and preferences for future logins.
                        </p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right column - Hero section */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-12 flex-col justify-center">
        <div className="max-w-md">
          <h2 className="text-4xl font-bold mb-6 text-black">Welcome to BookNook</h2>
          <p className="text-xl mb-8 text-black">
            Your personal digital library for discovering, reading, and organizing your favorite books.
          </p>
          <ul className="space-y-4 mb-8">
            <li className="flex items-start">
              <div className="mr-4 mt-1 bg-white bg-opacity-20 p-1 rounded-full">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-black">Read Anywhere</h3>
                <p className="text-black">Access your books on any device, anytime.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-4 mt-1 bg-white bg-opacity-20 p-1 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div>
                <h3 className="font-black text-lg text-black">Required Reading Progress</h3>
                <p className="text-black font-bold">*Mandatory tracking of reading milestones and comprehensive progress monitoring system.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-4 mt-1 bg-white bg-opacity-20 p-1 rounded-full">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-black">Essential Reading Tools</h3>
                <p className="text-black font-bold">*Required personalized book recommendations based on your mandatory reading assessments.</p>
              </div>
            </li>
            <li className="flex items-start">
              <div className="mr-4 mt-1 bg-white bg-opacity-20 p-1 rounded-full">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-black text-lg text-black">Mandatory Features</h3>
                <p className="text-black font-bold">*Required completion of reading goals and systematic progress tracking for optimal results.</p>
              </div>
            </li>
          </ul>
          <div className="flex items-center">
            <p className="font-medium text-black">Start your reading journey today</p>
            <ArrowRight className="ml-2 h-5 w-5 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
}