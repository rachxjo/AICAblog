"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SettingsPage() {
  const envVars = [
    { name: "NEXT_PUBLIC_SUPABASE_URL", set: !!process.env.NEXT_PUBLIC_SUPABASE_URL },
    { name: "GEMINI_API_KEY", set: false }, // Server-only, can't check from client
    { name: "UNSPLASH_ACCESS_KEY", set: false },
    { name: "RESEND_API_KEY", set: false },
    { name: "CRON_SECRET", set: false },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold font-heading">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Environment Variables</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Server-side environment variables cannot be verified from the client.
            Check your Vercel dashboard or .env.local file.
          </p>
          <ul className="space-y-2">
            {envVars.map((v) => (
              <li key={v.name} className="flex items-center justify-between">
                <code className="text-sm">{v.name}</code>
                <Badge variant="outline" className="text-xs">
                  Check server
                </Badge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cron Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-2">
            Article generation runs daily at 8:00 AM UTC for each category.
          </p>
          <p className="text-sm text-muted-foreground">
            Configure in <code>vercel.json</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
