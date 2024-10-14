import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

function PasswordInput({ label }) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  return (
    <div className="relative">
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder={label}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        className="w-full p-2 mt-1 border border-gray-300 rounded-md bg-gray-800 text-white focus:outline-none focus:ring focus:ring-indigo-500"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 flex items-center pr-3"
      >
        {showPassword ? (
          <EyeSlashIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
        ) : (
          <EyeIcon className="h-5 w-5 text-gray-500" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export default PasswordInput;
