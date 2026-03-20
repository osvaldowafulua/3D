"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import {
  Controller,
  FormProvider,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
  useFormContext,
} from "react-hook-form"

import { cn } from "@/lib/utils"

type FormFieldContextValue<TFieldValues extends FieldValues = FieldValues> = {
  name: FieldPath<TFieldValues>
}

const FormFieldContext = React.createContext<FormFieldContextValue | undefined>(undefined)

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue | undefined>(undefined)

export function Form<TFieldValues extends FieldValues>({
  children,
  ...form
}: UseFormReturn<TFieldValues> & { children?: React.ReactNode }) {
  return <FormProvider {...form}>{children}</FormProvider>
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  ...props
}: ControllerProps<TFieldValues> & { name: FieldPath<TFieldValues> }) {
  const { control } = useFormContext<TFieldValues>()
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller name={name} control={control} {...props} />
    </FormFieldContext.Provider>
  )
}

export function FormItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const id = React.useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  )
}

export const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<"label">
>(({ className, ...props }, ref) => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)

  const htmlFor =
    fieldContext && itemContext ? `${itemContext.id}-${fieldContext.name}` : undefined

  return (
    <label
      ref={ref}
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className,
      )}
      htmlFor={htmlFor}
      {...props}
    />
  )
})

FormLabel.displayName = "FormLabel"

export function FormControl(props: React.ComponentPropsWithoutRef<typeof Slot>) {
  const { getFieldState, formState } = useFormContext()
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)

  const fieldState = fieldContext ? getFieldState(fieldContext.name, formState) : null
  const error = fieldState?.error

  const descriptionId = itemContext ? `${itemContext.id}-${fieldContext?.name}-description` : undefined
  const messageId = itemContext ? `${itemContext.id}-${fieldContext?.name}-message` : undefined

  return (
    <Slot
      id={itemContext ? `${itemContext.id}-${fieldContext?.name}` : undefined}
      aria-describedby={error ? messageId : descriptionId}
      aria-invalid={!!error}
      {...props}
    />
  )
}

export function FormDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const itemContext = React.useContext(FormItemContext)
  const fieldContext = React.useContext(FormFieldContext)

  const id =
    itemContext && fieldContext ? `${itemContext.id}-${fieldContext.name}-description` : undefined

  return (
    <p
      id={id}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export function FormMessage({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  const { getFieldState, formState } = useFormContext()
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)

  const fieldState = fieldContext ? getFieldState(fieldContext.name, formState) : null
  const error = fieldState?.error

  const id =
    itemContext && fieldContext ? `${itemContext.id}-${fieldContext.name}-message` : undefined

  return (
    <p
      id={id}
      className={cn(
        "text-sm font-medium text-destructive",
        error ? "" : "hidden",
        className,
      )}
      {...props}
    >
      {error?.message as React.ReactNode}
    </p>
  )
}

