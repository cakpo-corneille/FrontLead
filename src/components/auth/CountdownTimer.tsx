import React, { useState, useEffect, useCallback } from 'react';

interface CountdownTimerProps {
  initialSeconds: number;
  onExpire?: () => void;
}

export const CountdownTimer = ({ initialSeconds, onExpire }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  // Memoize onExpire to prevent unnecessary re-runs of useEffect
  const memoizedOnExpire = useCallback(() => {
    onExpire?.();
  }, [onExpire]);

  useEffect(() => {
    if (timeLeft <= 0) {
      memoizedOnExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, memoizedOnExpire]); // Include memoizedOnExpire in dependencies

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let textColor = 'text-gray-600'; // Default color
  if (timeLeft <= 0) {
    textColor = 'text-red-600'; // Expired
  } else if (timeLeft < 60) {
    textColor = 'text-orange-600'; // Urgent (less than 60 seconds)
  }

  return (
    <div className={`text-center ${textColor}`}>
      {timeLeft <= 0 ? (
        <p className="font-semibold">Code expiré</p>
      ) : (
        <>
          <p className="text-sm mb-1">Code expire dans :</p>
          <p className="text-2xl font-mono font-bold">{display}</p>
        </>
      )}
    </div>
  );
};