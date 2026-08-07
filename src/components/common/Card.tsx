type CardProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}
