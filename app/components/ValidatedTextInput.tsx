import React, { useEffect, useState } from "react";
import { Text, TextInput } from "react-native";

interface ValidatedTextInputProps {
    name: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    required?: boolean;
    errorMessage?: string;
    onValidate?: (isValid: boolean) => void;
    maxLength?: number;
}

export default function ValidatedTextInput({
    value,
    onChangeText,
    placeholder,
    required = false,
    errorMessage = "Campo obbligatorio",
    onValidate,
    maxLength,
}: ValidatedTextInputProps) {
    const [touched, setTouched] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!touched) return;

        if (required && value.trim() === "") {
            setError(errorMessage);
            onValidate && onValidate(false);
        } else {
            setError("");
            onValidate && onValidate(true);
        }
    }, [value, touched, required, errorMessage]);

    return (
        <>
            <TextInput
                className={`border rounded px-3 py-2 ${error ? "border-red-500" : "border-gray-300"}`}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                onBlur={() => setTouched(true)}
                maxLength={maxLength}
            />
            {!!error && <Text className="text-red-500 mt-1">{error}</Text>}
        </>
    );
}