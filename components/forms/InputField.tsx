"use client";

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Input } from "../ui/input"
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const InputField = ({name, label, placeholder, type = "text" , register, error, validation, disabled, value}:FormInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordField = type === "password";
  const inputType = isPasswordField && showPassword ? "text" : type;

  return (
    <div className="space-y-4">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>
      <div className="relative">
        <Input
          type={inputType}
          id={name}
          placeholder={placeholder}
          disabled={disabled}
          value={value}
          className={cn("form-input", { 'opacity-50 cursor-not-allowed': disabled})}
          {...register(name, validation)}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="size-5" />
            ) : (
              <Eye className="size-5" />
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{error.message}</p>}

    </div>
  )
}

export default InputField