// Utility functions for handling API errors consistently

export interface ValidationError {
  type: string;
  loc: (string | number)[];
  msg: string;
  input?: any;
  ctx?: Record<string, any>;
}

export interface ApiError {
  detail?: string | ValidationError[];
  message?: string;
}

/**
 * Extracts a user-friendly error message from API error responses
 * Handles both simple string errors and complex validation errors
 */
export const extractErrorMessage = (error: any, defaultMessage = "An error occurred"): string => {
  // Handle cases where error is null or undefined
  if (!error) {
    return defaultMessage;
  }

  // Handle network errors
  if (error.message && !error.response) {
    if (error.message.includes('Network Error')) {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    return error.message || defaultMessage;
  }

  // Handle cases without response data
  if (!error?.response?.data) {
    return error.message || defaultMessage;
  }

  const errorData: ApiError = error.response.data;

  // Handle structured error objects (like USER_NOT_CONFIRMED)
  if (typeof errorData.detail === "object" && errorData.detail !== null && !Array.isArray(errorData.detail)) {
    const detailObj = errorData.detail as any;
    if (detailObj.message) {
      return detailObj.message;
    }
  }

  // Handle validation errors with detail array
  if (errorData.detail && Array.isArray(errorData.detail)) {
    const validationErrors = errorData.detail
      .map((err: ValidationError) => {
        const field = err.loc?.[err.loc.length - 1] || "field";
        // Clean up the error message for better user experience
        let message = err.msg;
        
        // Convert "Value error, " prefix to more user-friendly text
        if (message.startsWith("Value error, ")) {
          message = message.replace("Value error, ", "");
        }
        
        return `${field}: ${message}`;
      })
      .join(", ");
    return validationErrors;
  }

  // Handle simple error message
  if (typeof errorData.detail === "string") {
    return errorData.detail;
  }

  // Handle other error formats
  if (errorData.message) {
    return errorData.message;
  }

  return defaultMessage;
};

/**
 * Formats validation errors for display in forms
 * Returns an object with field names as keys and error messages as values
 */
export const extractFieldErrors = (error: any): Record<string, string> => {
  const fieldErrors: Record<string, string> = {};

  if (!error?.response?.data?.detail || !Array.isArray(error.response.data.detail)) {
    return fieldErrors;
  }

  const validationErrors: ValidationError[] = error.response.data.detail;

  validationErrors.forEach((err) => {
    const field = err.loc?.[err.loc.length - 1];
    if (field && typeof field === "string") {
      let message = err.msg;
      
      // Clean up the error message
      if (message.startsWith("Value error, ")) {
        message = message.replace("Value error, ", "");
      }
      
      fieldErrors[field] = message;
    }
  });

  return fieldErrors;
};

/**
 * Checks if an error is a verification error and extracts verification details
 */
export const extractVerificationError = (error: any): {
  isVerificationError: boolean;
  email?: string;
  verificationCodeSent?: boolean;
  message?: string;
} => {
  if (!error?.response?.data?.detail) {
    return { isVerificationError: false };
  }

  const errorData = error.response.data;
  
  // Check for structured verification error
  if (typeof errorData.detail === "object" && errorData.detail !== null && !Array.isArray(errorData.detail)) {
    const detailObj = errorData.detail as any;
    
    if (detailObj.error_type === "USER_NOT_CONFIRMED" || detailObj.requires_verification) {
      return {
        isVerificationError: true,
        email: detailObj.email,
        verificationCodeSent: detailObj.verification_code_sent,
        message: detailObj.message
      };
    }
  }

  // Check legacy verification error format
  if (error.message === 'EMAIL_NOT_VERIFIED' && error.userEmail) {
    return {
      isVerificationError: true,
      email: error.userEmail,
      verificationCodeSent: false,
      message: "Please verify your email before logging in"
    };
  }

  return { isVerificationError: false };
};