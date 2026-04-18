import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Lock, AlertCircle } from "lucide-react";
import { buildApiUrl } from "@/lib/api";

interface SharedReportPasswordModalProps {
  open: boolean;
  token: string;
  onPasswordVerified: (password: string) => void;
  onError: (error: string) => void;
}

export const SharedReportPasswordModal: React.FC<SharedReportPasswordModalProps> = ({
  open,
  token,
  onPasswordVerified,
  onError,
}) => {
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string>("");

  const handleVerify = async () => {
    if (password.length !== 7) {
      setError("Password must be 7 digits");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch(
        buildApiUrl(`/api/shared-reports/${token}/verify`),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Password verification failed");
      }

      if (data.success) {
        onPasswordVerified(password);
      } else {
        setError(data.message || "Invalid password");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to verify password";
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleVerify();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password Required
          </DialogTitle>
          <DialogDescription>
            This report is password-protected. Please enter the 7-digit password to view the report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="password">Password (7 digits)</Label>
            <Input
              id="password"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={7}
              value={password}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPassword(value);
                setError("");
              }}
              onKeyPress={handleKeyPress}
              placeholder="Enter 7-digit password"
              className="text-center text-2xl tracking-widest font-mono"
              disabled={isVerifying}
              autoFocus
            />
          </div>

          <Button
            onClick={handleVerify}
            disabled={isVerifying || password.length !== 7}
            className="w-full"
          >
            {isVerifying ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Verify & View Report"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

