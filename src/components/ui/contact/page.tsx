export default function ContactPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <Facebook className="h-5 w-5 text-blue-500" />
        <div>
          <h3 className="font-medium">Facebook</h3>
          <span className="text-sm text-muted-foreground">Coming Soon</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Instagram className="h-5 w-5 text-blue-500" />
        <div>
          <h3 className="font-medium">Instagram</h3>
          <span className="text-sm text-muted-foreground">Coming Soon</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <ExternalLink className="h-5 w-5 text-blue-500" />
        <div>
          <h3 className="font-medium">BlueSky</h3>
          <span className="text-sm text-muted-foreground">Coming Soon</span>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <Linkedin className="h-5 w-5 text-blue-500" />
        <div>
          <h3 className="font-medium">LinkedIn</h3>
          <span className="text-sm text-muted-foreground">Coming Soon</span>
        </div>
      </div>
    </div>
  );
} 