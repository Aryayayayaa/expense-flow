export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Spinner Wheel */}
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
        {/* Optional Loading Text */}
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Loading content, please wait...
        </p>
      </div>
    </div>
  );
}
