"use client"

import type React from "react"

import { useState } from "react"
import { z } from "zod"
import { validateData, formatValidationErrors } from "@/utils/validation-utils"

interface FormValidationProps<T extends z.ZodType<any, any>> {
  schema: T
  onSubmit: (data: z.infer<T>) => Promise<void>
  children: (props: {
    register: (field: string) => {
      name: string
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
      onBlur: () => void
    }
    errors: Record<string, string>
    isSubmitting: boolean
    handleSubmit: (e: React.FormEvent) => void
  }) => React.ReactNode
}

export function FormValidation<T extends z.ZodType<any, any>>({ schema, onSubmit, children }: FormValidationProps<T>) {
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const register = (field: string) => ({
    name: field,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value

      setFormData((prev) => ({ ...prev, [field]: value }))

      // Clear error when field is changed
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field]
          return newErrors
        })
      }
    },
    onBlur: () => {
      // Validate field on blur
      const fieldSchema = schema.shape[field as keyof typeof schema.shape]
      if (fieldSchema) {
        try {
          fieldSchema.parse(formData[field])
          // Clear error if validation passes
          if (errors[field]) {
            setErrors((prev) => {
              const newErrors = { ...prev }
              delete newErrors[field]
              return newErrors
            })
          }
        } catch (error) {
          if (error instanceof z.ZodError) {
            const fieldErrors = formatValidationErrors(error)
            setErrors((prev) => ({ ...prev, ...fieldErrors }))
          }
        }
      }
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsSubmitting(true)

    try {
      // Validate all form data
      const validation = validateData(schema, formData)

      if (!validation.success) {
        setErrors(formatValidationErrors(validation.errors))
        return
      }

      // Clear errors
      setErrors({})

      // Submit form
      await onSubmit(validation.data)
    } catch (error) {
      console.error("Form submission error:", error)

      // Handle API errors
      if (error instanceof Error) {
        setErrors({ form: error.message })
      } else {
        setErrors({ form: "An unexpected error occurred" })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return children({ register, errors, isSubmitting, handleSubmit })
}
