"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Maximize2, Copy, ExternalLink, Check } from "lucide-react";

interface FullPreviewProps {
  templatePath: string;
  templateName: string;
}

export function FullPreview({ templatePath, templateName }: FullPreviewProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyHtmlToClipboard = async () => {
    try {
      const response = await fetch(templatePath);
      const html = await response.text();
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy HTML:", error);
    }
  };

  const openInNewTab = () => {
    window.open(templatePath, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Maximize2 className="mr-2 h-4 w-4" />
          Full Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{templateName}</DialogTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyHtmlToClipboard}>
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy HTML
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={openInNewTab}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 border rounded-md overflow-hidden bg-white">
          <iframe
            src={templatePath}
            className="w-full h-full"
            title={`Full preview of ${templateName}`}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
} 