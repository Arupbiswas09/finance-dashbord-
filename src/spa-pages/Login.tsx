import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, Shield, Loader2, Cloud } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage, extractVerificationError } from "@/lib/errorHandling";
import { AuthGuard } from "@/components/AuthGuard";
import illustrationImage from "@/assets/Data extraction-pana (1) 1.png";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isDev =
    (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || "development") === "development";

  const { login, error, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Role-based redirect logic
  function getRoleBasedRedirect() {
    if (!user?.role) return "/dashboard-modern";

    switch (user.role.name) {
      case "admin":
        return "/dashboard-modern";
      case "manager":
        return "/reports";
      case "viewer":
        return "/reports";
      default:
        return "/dashboard-modern";
    }
  }

  const from = location.state?.from?.pathname;
  const isGenericHome =
    !from || from === "/dashboard" || from === "/dashboard-modern";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);

      toast({
        title: "Success",
        description: "Welcome back! You have successfully logged in.",
      });

      // Navigate with role-based redirect after successful login
      const redirectPath = isGenericHome ? getRoleBasedRedirect() : from;
      navigate(redirectPath, { replace: true });
    } catch (error: any) {
      // Check if it's an email verification error
      const verificationError = extractVerificationError(error);

      if (verificationError.isVerificationError && verificationError.email) {
        // Store email for verification page
        localStorage.setItem('verification_email', verificationError.email);

        const toastMessage = verificationError.verificationCodeSent
          ? "A new verification code has been sent to your email. Please check your inbox and verify your email."
          : "Please verify your email before logging in.";

        toast({
          title: "Email Verification Required",
          description: `${toastMessage} Redirecting to verification page...`,
          variant: "destructive",
        });

        // Redirect to verification page after a short delay
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(verificationError.email!)}&from=login`);
        }, 3000);
        return;
      }

      const errorMessage = extractErrorMessage(error, "Invalid credentials");

      toast({
        title: "Login failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen flex bg-white">
        {/* Left side - Branding with Illustration */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden bg-[#0a0021]">
          {/* Decorative dots */}
          <div className="absolute top-12 left-12 w-2 h-2 bg-white/20 rounded-full"></div>
          <div className="absolute top-32 left-24 w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="absolute top-24 right-32 w-2 h-2 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-64 left-16 w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-32 right-24 w-2 h-2 bg-white/20 rounded-full"></div>
          <div className="absolute top-1/2 left-8 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
          <div className="absolute top-1/3 right-16 w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-1/3 right-8 w-1.5 h-1.5 bg-white/20 rounded-full"></div>
          <div className="absolute top-20 right-1/4 w-1 h-1 bg-white/20 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-white/20 rounded-full"></div>

          <div className="max-w-2xl w-full z-10">
            {/* Illustration */}
            <div className="mb-12 flex justify-center">
              <img
                src={illustrationImage.src}
                alt="Data Extraction Illustration"
                className="w-full max-w-xl"
              />
            </div>

            {/* Text Content */}
            <div className="text-center px-8">
              <h2 className="text-3xl font-bold bg-gradient-to-b from-white to-[#999999] bg-clip-text text-transparent mb-6">
                Automate your accounting with <br /> intelligent AI workflows
              </h2>
              <p className="text-base text-gray-300">
                Role-based access control, Secure Cloud authentication, Real time synchronization
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md flex flex-col">
            <Card className="w-full bg-white shadow-sm border-none">
              <CardHeader className="text-center space-y-3 pb-6 pt-8">
                <div className="flex justify-center mb-2">
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center">
                    <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" clipRule="evenodd" d="M42.3 15.0492C44.5368 15.0492 46.35 13.2657 46.35 11.0656C46.35 8.86549 44.5368 7.08197 42.3 7.08197C40.0632 7.08197 38.25 8.86549 38.25 11.0656C38.25 13.2657 40.0632 15.0492 42.3 15.0492Z" fill="#7F265B" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M12.1501 15.0492C14.3869 15.0492 16.2001 13.2657 16.2001 11.0656C16.2001 8.86549 14.3869 7.08197 12.1501 7.08197C9.91334 7.08197 8.1001 8.86549 8.1001 11.0656C8.1001 13.2657 9.91334 15.0492 12.1501 15.0492Z" fill="#7F265B" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M12.1501 46.918C14.3869 46.918 16.2001 45.1345 16.2001 42.9344C16.2001 40.7343 14.3869 38.9508 12.1501 38.9508C9.91334 38.9508 8.1001 40.7343 8.1001 42.9344C8.1001 45.1345 9.91334 46.918 12.1501 46.918Z" fill="#7F265B" />
                      <path fillRule="evenodd" clipRule="evenodd" d="M42.3 46.918C44.5368 46.918 46.35 45.1345 46.35 42.9344C46.35 40.7343 44.5368 38.9508 42.3 38.9508C40.0632 38.9508 38.25 40.7343 38.25 42.9344C38.25 45.1345 40.0632 46.918 42.3 46.918Z" fill="#7F265B" />
                      <rect y="24.3443" width="54" height="5.31148" rx="2.65574" fill="#555555" />
                      <rect x="29.7" y="31.8689" width="22.1311" height="5.4" rx="2.7" transform="rotate(90 29.7 31.8689)" fill="#555555" />
                      <rect x="29.7" width="22.1311" height="5.4" rx="2.7" transform="rotate(90 29.7 0)" fill="#555555" />
                    </svg>
                  </div>
                </div>
                <CardTitle className="text-2xl font-bold text-[#525252]">Welcome Back</CardTitle>
                <CardDescription className="text-sm text-[#525252]">
                  Sign in to your SmartAccount AI dashboard
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {typeof error === 'string' ? error : (typeof error === 'object' ? JSON.stringify(error) : error)}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-[#525252]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="mail@abc.com"
                      className="h-12 border-gray-200 focus:border-[#0a0021] focus:ring-[#0a0021]"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-[#525252]">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Your password"
                        className="h-12 pr-10 border-gray-200 focus:border-[#2C5F9F] focus:ring-[#2C5F9F]"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-smooth"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm pt-1">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="remember"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#0a0021] focus:ring-[#0a0021]"
                      />
                      <label htmlFor="remember" className="text-[#525252] cursor-pointer select-none">
                        Remember Me
                      </label>
                    </div>
                    <Link
                      to="/forgot-password"
                      className="text-[#0a0021] hover:underline transition-smooth"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-12 bg-[#0a0021] hover:bg-[#0d0029] text-white font-medium mt-6 rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>

                  {isDev && (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-12"
                      disabled={isLoading}
                      onClick={() => {
                        setEmail("test@local.dev");
                        setPassword("test1234");
                        toast({
                          title: "Test credentials filled",
                          description: "Email: test@local.dev, Password: test1234",
                        });
                      }}
                    >
                      Use test credentials
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Registration Link - Below Card */}
            <div className="mt-6 text-center text-sm">
              <span className="text-[#525252]">Not Registered Yet? </span>
              <Link
                to="/register"
                className="text-[#135290] hover:underline font-medium transition-smooth"
              >
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Login;