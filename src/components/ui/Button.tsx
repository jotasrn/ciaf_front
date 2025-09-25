import React from 'react';
import { Loader2 } from 'lucide-react';

// Tipos para as propriedades do botão
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  ...props
}: ButtonProps) {

  // Estilos base, aplicados a todos os botões
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  // Mapeamento de variantes para classes do Tailwind
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
  };

  // Mapeamento de tamanhos para classes do Tailwind
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  // Combina todas as classes de estilo
  const combinedClassName = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button
      className={combinedClassName}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {/* Exibe o texto do filho se for string, para mostrar "Entrando..." */}
          {typeof children === 'string' ? children : 'Carregando...'}
        </>
      ) : (
        children
      )}
    </button>
  );
}