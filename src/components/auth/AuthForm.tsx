import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Activity } from 'lucide-react';

const MOTIVATIONAL_QUOTES = [
  "Every rep is a vote for the person you want to become.",
  "Sweat is just your strength shining through.",
  "Embrace the burn; it's sculpting a stronger you.",
  "Every workout is a fresh start for your body.",
  "One set at a time, one goal at a time—keep moving.",
  "Small steps forward still carry you toward greatness.",
  "Progress thrives in every drop of sweat.",
  "When you think you're done, push one more rep.",
  "A tired muscle today is tomorrow's power.",
  "Push yourself; every move is proof of your potential.",
  "Your strength grows in direct proportion to your courage.",
  "Feel the burn, embrace the change.",
  "Defeat doubt by doing one more lap.",
  "Every breath fuels your resilience.",
  "Consistency carves out the body you desire.",
  "Turn every obstacle into the spark that fuels your fire.",
  "Shape your body, sharpen your mind.",
  "The best project you'll ever work on is you.",
  "Discomfort today is the strength you carry tomorrow.",
  "Your workout is your superpower in progress.",
  "Victory is found in the challenge you refuse to skip.",
  "Every lunge brings you closer to your goals.",
  "Reset your mind, then recharge your muscles.",
  "Confidence is built one squat at a time.",
  "Find the power in pushing past your limits.",
  "No matter how slow, you're still beating yesterday.",
  "Harness the hurt, transform it into strength.",
  "Your determination outruns every excuse.",
  "Forge the future body you dream of, rep by rep.",
  "Leave doubt behind; carry motivation with every stride."
];

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();
  const [quote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[randomIndex];
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Activity className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shape Shifter</h1>
          <p className="text-lg font-medium text-indigo-600 italic">"{quote}"</p>
        </div>
        
        <h2 className="text-xl font-semibold mb-6 text-center text-gray-800">
          {isSignUp ? 'Create Your Account' : 'Welcome Back'}
        </h2>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}