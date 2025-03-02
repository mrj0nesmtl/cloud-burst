"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Plus, Save } from "lucide-react";
import { createTemplate, Template } from "@/lib/supabase/templates";

export function CreateTemplate() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    template_id: "",
    name: "",
    type: "email",
    subject: "",
    body: "",
    html_content: "",
    active: true
  });

  const handleInputChange = (field: keyof Template, value: string | boolean) => {
    setNewTemplate(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!newTemplate.template_id) {
      setError("Template ID is required");
      return false;
    }
    if (!newTemplate.name) {
      setError("Template name is required");
      return false;
    }
    if (newTemplate.type === "email" && !newTemplate.subject) {
      setError("Subject is required for email templates");
      return false;
    }
    if (!newTemplate.html_content) {
      setError("Template content is required");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await createTemplate(newTemplate as Template);
      setOpen(false);
      // Reset form
      setNewTemplate({
        template_id: "",
        name: "",
        type: "email",
        subject: "",
        body: "",
        html_content: "",
        active: true
      });
      setError(null);
    } catch (err: any) {
      console.error("Error creating template:", err);
      setError(err.message || "Failed to create template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {error && (
            <div className="bg-destructive/10 p-4 rounded-md text-destructive">
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-2"
                onClick={() => setError(null)}
              >
                Dismiss
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="template_id" className="text-right">
              Template ID
            </Label>
            <Input
              id="template_id"
              value={newTemplate.template_id}
              onChange={(e) => handleInputChange("template_id", e.target.value)}
              className="col-span-3"
              placeholder="e.g., welcome-email"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newTemplate.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="col-span-3"
              placeholder="e.g., Welcome Email"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Type
            </Label>
            <Select 
              value={newTemplate.type as string} 
              onValueChange={(value) => handleInputChange("type", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select template type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push Notification</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {newTemplate.type === "email" && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                value={newTemplate.subject || ""}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="col-span-3"
                placeholder="Email subject line"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="html_content" className="text-right pt-2">
              Content
            </Label>
            <div className="col-span-3">
              <Textarea
                id="html_content"
                value={newTemplate.html_content || ""}
                onChange={(e) => handleInputChange("html_content", e.target.value)}
                className="min-h-[300px] font-mono text-sm"
                placeholder={newTemplate.type === "email" ? "HTML content" : "Template content"}
              />
              {newTemplate.type === "email" && (
                <p className="text-sm text-muted-foreground mt-2">
                  Available variables: {`{{ .ConfirmationURL }}, {{ .Token }}, {{ .TokenHash }}, {{ .SiteURL }}, {{ .Email }}, {{ .Data }}, {{ .RedirectTo }}`}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Template
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 