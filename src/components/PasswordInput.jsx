import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordInput = ({ value, onChange, placeholder, name, required = false }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        type={showPassword ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShowPassword((value) => !value)}
        aria-label="Toggle password visibility"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        <span>{showPassword ? 'Hide' : 'Show'}</span>
      </button>
    </div>
  );
};

export default PasswordInput;
