import { Toaster as SonnerToaster } from 'sonner';

export function Toaster(props) {
  return (
    <SonnerToaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: 'var(--color-ink)',
          color: 'white',
          border: 'none',
          fontSize: '0.8125rem',
          borderRadius: '0.5rem',
        },
      }}
      {...props}
    />
  );
}