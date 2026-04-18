import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2, Mail, CheckCircle, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { extractErrorMessage } from "@/lib/errorHandling";
import { useAuth } from "@/contexts/AuthContext";

const VerifyEmail = () => {
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [fromLogin, setFromLogin] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { confirmRegistration, resendConfirmationCode, login } = useAuth();

  // Get email from URL params or localStorage
  useEffect(() => {
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('verification_email');
    const isFromLogin = searchParams.get('from') === 'login';
    
    setFromLogin(isFromLogin);
    
    if (emailParam) {
      setEmail(emailParam);
      localStorage.setItem('verification_email', emailParam);
      
      // Show welcome message if coming from login with fresh code
      if (isFromLogin) {
        toast({
          title: "Fresh Verification Code Sent!",
          description: "We've sent a new verification code to your email. Please check your inbox.",
        });
      }
    } else if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // If no email available, redirect to register
      navigate('/register');
    }
  }, [searchParams, navigate, toast]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await confirmRegistration(email, verificationCode.trim());

      if (result.success) {
        setIsVerified(true);
        localStorage.removeItem('verification_email');
        
        toast({
          title: "Email Verified!",
          description: "Your email has been successfully verified. Logging you in...",
        });

        // After verification, automatically log the user in
        setTimeout(async () => {
          try {
            // Get the stored password if available (from registration flow)
            const storedPassword = localStorage.getItem('temp_password');
            
            if (storedPassword && email) {
              // Auto-login after verification
              await login(email, storedPassword);
              localStorage.removeItem('temp_password');
              
              toast({
                title: "Welcome!",
                description: "You're now logged in and ready to go!",
              });
              
              navigate("/dashboard-modern");
            } else {
              // Fallback to login page if no stored password
              navigate('/login', { 
                state: { 
                  message: 'Email verified successfully! Please log in.',
                  email: email 
                }
              });
            }
          } catch (loginError) {
            console.error('Auto-login failed:', loginError);
            // Fallback to login page
            navigate('/login', { 
              state: { 
                message: 'Email verified successfully! Please log in.',
                email: email 
              }
            });
          }
        }, 2000);
      }
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error, "Verification failed");
      setError(errorMessage);
      
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError("Email not found. Please register again.");
      return;
    }

    setIsResending(true);
    setError("");

    try {
      const result = await resendConfirmationCode(email);

      if (result.success) {
        toast({
          title: "Code Sent",
          description: "A new verification code has been sent to your email.",
        });
        
        setCountdown(60); // 60 second cooldown
        setVerificationCode(""); // Clear the input
      }
    } catch (error: any) {
      const errorMessage = extractErrorMessage(error, "Failed to resend code");
      setError(errorMessage);
      
      toast({
        title: "Resend failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md shadow-card text-center">
          <CardHeader>
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <CardTitle className="text-2xl font-bold text-green-700">Email Verified!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. Redirecting to login...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero items-center justify-center p-12">
        <div className="text-center text-white">
          <div className="mb-8">
            <Shield className="w-16 h-16 mx-auto mb-4 animate-glow" />
            <h1 className="text-4xl font-bold mb-4">Almost There!</h1>
            <p className="text-xl opacity-90">
              Please verify your email to complete your registration
            </p>
          </div>
          <div className="space-y-4 text-left max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Check your email for the verification code</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Enter the 6-digit code below</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Access your SmartAccount AI dashboard</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md shadow-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
            <CardDescription>
              {fromLogin ? (
                <>
                  A fresh verification code has been sent to
                  <br />
                  <strong>{email}</strong>
                  <br />
                  <span className="text-sm text-green-600 mt-1 block">
                    Please check your email inbox
                  </span>
                </>
              ) : (
                <>
                  We've sent a verification code to
                  <br />
                  <strong>{email}</strong>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                <Mail className="h-4 w-4" />
                Check your email inbox
              </div>
            </div>
            
            <form onSubmit={handleVerifyCode} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {typeof error === 'string' ? error : (typeof error === 'object' ? JSON.stringify(error) : error)}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-4">
                <Label htmlFor="verificationCode" className="text-center block text-lg font-semibold">
                  Verification Code
                </Label>
                
                {/* Modern 6-digit input boxes */}
                <div className="flex justify-center gap-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <Input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      className="w-12 h-12 text-center text-xl font-bold border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg"
                      value={verificationCode[index] || ''}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        if (value) {
                          const newCode = verificationCode.split('');
                          newCode[index] = value;
                          const newCodeString = newCode.join('').slice(0, 6);
                          setVerificationCode(newCodeString);
                          setError("");
                          
                          // Auto-focus next input
                          if (value && index < 5) {
                            const nextInput = document.querySelector(`input:nth-of-type(${index + 2})`) as HTMLInputElement;
                            if (nextInput) nextInput.focus();
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
                          // Focus previous input on backspace
                          const prevInput = document.querySelector(`input:nth-of-type(${index})`) as HTMLInputElement;
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      onPaste={(e) => {
                        e.preventDefault();
                        const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                        setVerificationCode(paste);
                        setError("");
                      }}
                      disabled={isLoading}
                    />
                  ))}
                </div>
                
                <p className="text-sm text-muted-foreground text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={isLoading || verificationCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Didn't receive the code?
                </p>
                
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendCode}
                  disabled={isResending || countdown > 0}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : countdown > 0 ? (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Resend in {countdown}s
                    </>
                  ) : (
                    <>
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Resend Code
                    </>
                  )}
                </Button>

                <p className="text-sm text-muted-foreground">
                  Wrong email?{" "}
                  <Link 
                    to="/register" 
                    className="text-primary hover:underline transition-smooth font-medium"
                    onClick={() => localStorage.removeItem('verification_email')}
                  >
                    Register again
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VerifyEmail;