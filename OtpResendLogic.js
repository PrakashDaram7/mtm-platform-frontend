import { useState, useEffect } from 'react';

export const useOtpResend = (otpLength = 6, cooldownSeconds = 30, maxAttempts = 3) => {
  // OTP State
  const [otp, setOtp] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  // Resend State
  const [cooldownTime, setCooldownTime] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  // Cooldown Timer Effect
  useEffect(() => {
    let interval;
    if (cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => prev - 1);
      }, 1000);
    } else if (cooldownTime === 0 && isDisabled) {
      setIsDisabled(false);
    }
    return () => clearInterval(interval);
  }, [cooldownTime, isDisabled]);

  // OTP Functions
  const generateOtp = () => {
    const newOtp = Math.floor(Math.random() * Math.pow(10, otpLength))
      .toString()
      .padStart(otpLength, '0');
    setOtp(newOtp);
    return newOtp;
  };

  const verifyOtp = (userOtp) => {
    const verified = userOtp === otp;
    setIsVerified(verified);
    return verified;
  };

  const clearOtp = () => {
    setOtp('');
    setIsVerified(false);
  };

  // Resend Functions
  const handleResend = () => {
    if (attempts < maxAttempts) {
      setAttempts(prev => prev + 1);
      setCooldownTime(cooldownSeconds);
      setIsDisabled(true);
      generateOtp();
      return true;
    }
    return false;
  };

  const resetAll = () => {
    setAttempts(0);
    setCooldownTime(0);
    setIsDisabled(false);
    clearOtp();
  };

  return {
    otp,
    isVerified,
    cooldownTime,
    attempts,
    isDisabled,
    maxAttempts,
    generateOtp,
    verifyOtp,
    clearOtp,
    handleResend,
    resetAll
  };
};