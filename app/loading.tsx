export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
        <span>Loading...</span>
      </div>
    </div>
  )
}
