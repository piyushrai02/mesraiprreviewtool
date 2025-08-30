import React from 'react';
import { cn } from '@/lib/utils';

export interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {}

export function Form({ className, ...props }: FormProps) {
  return (
    <form className={cn('space-y-6', className)} {...props} />
  );
}

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {}

export function FormField({ className, ...props }: FormFieldProps) {
  return (
    <div className={cn('space-y-2', className)} {...props} />
  );
}

export interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export function FormLabel({ className, ...props }: FormLabelProps) {
  return (
    <label
      className={cn(
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className
      )}
      {...props}
    />
  );
}

export interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {}

export function FormMessage({ className, ...props }: FormMessageProps) {
  return (
    <p
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    />
  );
}