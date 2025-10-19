'use client';

import { cn } from '@/lib/utils';

interface LoadingLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  text?: string;
}

export function LoadingLogo({
  size = 'md',
  className,
  showText = true,
  text = 'Loading...',
}: LoadingLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
    xl: 'h-20 w-20',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center space-y-3',
        className
      )}
    >
      {/* Animated Logo Container */}
      <div className={cn('relative', sizeClasses[size])}>
        {/* Rotating Background Circle */}
        <div className='absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-spin'></div>

        {/* Pulsing Logo */}
        <div className='relative z-10 flex items-center justify-center h-full w-full'>
          <img
            src='/logo.jpg'
            alt="Hotte Design D'Intérieur & Couture"
            className='h-full w-full object-contain animate-logo-pulse-slow animate-logo-float'
          />
        </div>

        {/* Rotating Ring */}
        <div className='absolute inset-0 rounded-full border-2 border-transparent border-t-blue-500 border-r-purple-500 animate-spin'></div>
      </div>

      {/* Loading Text */}
      {showText && (
        <div className='text-center'>
          <p
            className={cn(
              'font-medium text-gray-600 animate-pulse',
              textSizeClasses[size]
            )}
          >
            {text}
          </p>
          {/* Animated Dots */}
          <div className='flex justify-center space-x-1 mt-2'>
            <div className='w-1 h-1 bg-blue-500 rounded-full animate-bounce'></div>
            <div
              className='w-1 h-1 bg-blue-500 rounded-full animate-bounce'
              style={{ animationDelay: '0.1s' }}
            ></div>
            <div
              className='w-1 h-1 bg-blue-500 rounded-full animate-bounce'
              style={{ animationDelay: '0.2s' }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
}

// Full Screen Loading Overlay
export function FullScreenLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/95 backdrop-blur-sm'>
      <div className='text-center'>
        <LoadingLogo size='xl' text={text} />
        <div className='mt-8'>
          <div className='w-32 h-1 bg-gray-200 rounded-full overflow-hidden'>
            <div className='h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse'></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Loading Spinner
export function InlineLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className='flex items-center justify-center py-8'>
      <LoadingLogo size='md' text={text} />
    </div>
  );
}
