import React, { useState } from "react";
import { SignIn } from "./SignIn";
import { SignUp } from "./SignUp";

export const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {isSignUp ? (
        <SignUp onSwitchToSignIn={() => setIsSignUp(false)} />
      ) : (
        <SignIn onSwitchToSignUp={() => setIsSignUp(true)} />
      )}
    </div>
  );
};
