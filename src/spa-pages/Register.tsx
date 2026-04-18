import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Lock, Mail, User, Shield, Loader2, Building2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/errorHandling";
import { AuthGuard } from "@/components/AuthGuard";
import illustrationImage from "@/assets/Data extraction-pana (1) 1.png";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    organizationName: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState("");

  const { register, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    setValidationError("");
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setValidationError("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setValidationError("Email is required");
      return false;
    }
    if (!formData.organizationName.trim()) {
      setValidationError("Organization name is required");
      return false;
    }
    if (!formData.password) {
      setValidationError("Password is required");
      return false;
    }
    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(formData.email, formData.password, formData.fullName, formData.organizationName);
      
      // Check if email verification is required
      if (result && result.requires_confirmation) {
        // Store email and password temporarily for auto-login after verification
        localStorage.setItem('verification_email', formData.email);
        localStorage.setItem('temp_password', formData.password);
        
        toast({
          title: "Registration Successful!",
          description: "Please check your email for a verification code to complete your registration.",
        });
        
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        // User is already verified
        toast({
          title: "Success",
          description: "Organization and account created successfully! Welcome aboard!",
        });
        navigate("/dashboard-modern");
      }
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error, "Failed to create account");
      
      toast({
        title: "Registration failed",
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
                Automate your accounting with intelligent AI workflows
              </h2>
              <p className="text-base text-gray-300">
                Role-based access control, Secure Cloud authentication, Real time synchronization
              </p>
            </div>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="flex-1 flex items-center justify-center p-8 bg-white">
          <Card className="w-full max-w-md bg-white shadow-sm border border-gray-100">
            <CardHeader className="text-center space-y-3 pb-6 pt-8">
              <div className="flex justify-center mb-2">
                <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center">
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
                    <div className="w-2.5 h-2.5 bg-gray-700 rounded-full"></div>
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">Create your account</CardTitle>
              <CardDescription className="text-sm text-gray-600">
                Get started with SmartAccount AI
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {(error || validationError) && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {validationError || error || "An error occurred during registration"}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">Full name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                      className="h-11 border-gray-200 focus:border-[#0a0021] focus:ring-[#0a0021]"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="mail@abc.com"
                      className="h-11 border-gray-200 focus:border-[#0a0021] focus:ring-[#0a0021]"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName" className="text-sm font-medium text-gray-700">Organization name</Label>
                  <Input
                    id="organizationName"
                    type="text"
                    placeholder="Your Company Inc."
                      className="h-11 border-gray-200 focus:border-[#0a0021] focus:ring-[#0a0021]"
                    value={formData.organizationName}
                    onChange={handleChange}
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a password (min. 8 characters)"
                      className="h-11 pr-10 border-gray-200 focus:border-[#2C5F9F] focus:ring-[#2C5F9F]"
                      value={formData.password}
                      onChange={handleChange}
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

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      className="h-11 pr-10 border-gray-200 focus:border-[#2C5F9F] focus:ring-[#2C5F9F]"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={isLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-smooth"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
                      Creating account...
                    </>
                  ) : (
                    "Create account"
                  )}
                </Button>

                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500 mb-3">
                    By creating an account, you'll be the admin of your organization.
                  </p>
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="text-[#0a0021] hover:underline font-medium transition-smooth"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
};

export default Register;