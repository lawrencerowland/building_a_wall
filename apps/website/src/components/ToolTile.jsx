import clsx from 'clsx';

export default function ToolTile({ children, className, ...props }) {
  return (
    <button
      className={clsx(
        'aspect-square flex flex-col items-center justify-center bg-accent-50 border border-accent-200',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
