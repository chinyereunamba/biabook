import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export function CompletionStep({ businessData }: { businessData: any }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const bookingUrl = `https://biabook.app/book/${businessData.name
      .toLowerCase()
      .replace(/\s+/g, "-")}`;
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy link");
    }
  };

  return (
    <Card className="border-gray-200 shadow-lg">
      <CardContent className="p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mb-4 text-3xl font-bold">You&apos;re all set!</h2>
        <p className="mb-8 text-xl">
          Your booking page is ready. Start sharing it with your customers!
        </p>

        <div className="mb-8 rounded-lg bg-gray-50 p-6">
          <h3 className="mb-4 font-semibold text-gray-800">Your booking page URL:</h3>
          <div className="flex items-center justify-center space-x-2 rounded-md border border-gray-200 bg-white p-3">
            <span className="font-mono text-purple-600 text-sm overflow-hidden text-ellipsis whitespace-nowrap max-w-[200px] sm:max-w-none">
              https://biabook.app/book/
              {businessData.name.toLowerCase().replace(/\s+/g, "-")}
            </span>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-300 shrink-0"
              onClick={copyToClipboard}
            >
              {copied ? (
                <>
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Copied!
                </>
              ) : (
                "Copy"
              )}
            </Button>
          </div>
        </div>

        <div className="mb-8 grid gap-4 text-left md:grid-cols-2">
          <div className="rounded-lg bg-purple-50 p-4">
            <h4 className="mb-2 font-semibold text-purple-900">
              ✨ What&apos;s next?
            </h4>
            <ul className="space-y-1 text-sm text-purple-700">
              <li>• Share your booking link</li>
              <li>• Enable WhatsApp notifications</li>
              <li>• Customize your page</li>
            </ul>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-900">📱 Pro tip</h4>
            <p className="text-sm text-blue-700">
              Add your booking link to your social media bio and business
              cards for easy access!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
