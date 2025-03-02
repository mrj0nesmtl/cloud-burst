"use client";

import { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save } from "lucide-react";
import { Template } from "@/lib/supabase/templates";

interface TemplateEditorProps {
  template: Template;
  onSave: (template: Template) => void;
}

export function TemplateEditor({ template, onSave }: TemplateEditorProps) {
  const [open, setOpen] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState<Template>(template);
  const [loading, setLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState<string>("");

  // Update local state when template prop changes
  useEffect(() => {
    setEditedTemplate(template);
  }, [template]);

  // Generate preview HTML when edited template changes
  useEffect(() => {
    const generatePreview = async () => {
      try {
        // For email templates, we need to fetch the HTML content
        if (editedTemplate.type === 'email') {
          const response = await fetch(`/api/templates/${editedTemplate.template_id}/html`);
          if (response.ok) {
            const html = await response.text();
            setPreviewHtml(html);
          }
        }
      } catch (error) {
        console.error("Error generating preview:", error);
      }
    };

    if (open) {
      generatePreview();
    }
  }, [editedTemplate, open]);

  const handleInputChange = (field: keyof Template, value: string | boolean) => {
    setEditedTemplate(prev => ({
      ...prev,
      [field]: value,
      // Mark as not synced when edited
      synced_with_auth: false
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave(editedTemplate);
      setOpen(false);
    } catch (error) {
      console.error("Error saving template:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Template</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Template: {template.name}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={editedTemplate.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="col-span-3"
            />
          </div>
          
          {editedTemplate.type === 'email' && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Subject
              </Label>
              <Input
                id="subject"
                value={editedTemplate.subject || ''}
                onChange={(e) => handleInputChange("subject", e.target.value)}
                className="col-span-3"
              />
            </div>
          )}
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="body" className="text-right pt-2">
              Body
            </Label>
            <div className="col-span-3">
              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <Textarea
                    id="body"
                    value={editedTemplate.html_content || ''}
                    onChange={(e) => handleInputChange("html_content", e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Available variables: {`{{ .ConfirmationURL }}, {{ .Token }}, {{ .TokenHash }}, {{ .SiteURL }}, {{ .Email }}, {{ .Data }}, {{ .RedirectTo }}`}
                  </p>
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-md overflow-hidden h-[300px] bg-white">
                    <iframe
                      srcDoc={previewHtml}
                      className="w-full h-full"
                      title="Template Preview"
                    />
                  </div>
                </TabsContent>
              </Tabs>
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
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 