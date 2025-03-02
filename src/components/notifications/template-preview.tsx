"use client";

import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, RefreshCw } from "lucide-react";
import { TemplateEditor } from "./template-editor";
import { FullPreview } from "./full-preview";
import { 
  getTemplates, 
  getTemplateById, 
  updateTemplate, 
  syncTemplateWithAuth,
  Template
} from "@/lib/supabase/templates";

export function TemplatePreview() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch templates on component mount
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const emailTemplates = await getTemplates();
        setTemplates(emailTemplates);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setError("Failed to load templates");
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Fetch selected template details
  useEffect(() => {
    const fetchTemplateDetails = async () => {
      if (!selectedTemplateId) {
        setCurrentTemplate(null);
        return;
      }

      try {
        setLoading(true);
        const template = await getTemplateById(selectedTemplateId);
        setCurrentTemplate(template);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching template ${selectedTemplateId}:`, err);
        setError(`Failed to load template ${selectedTemplateId}`);
        setLoading(false);
      }
    };

    fetchTemplateDetails();
  }, [selectedTemplateId]);

  // Handle template selection
  const handleTemplateChange = (value: string) => {
    setSelectedTemplateId(value);
  };

  // Handle template save
  const handleSaveTemplate = async (updatedTemplate: Template) => {
    try {
      setLoading(true);
      const savedTemplate = await updateTemplate(updatedTemplate);
      
      // Update the template in the local state
      setCurrentTemplate(savedTemplate);
      setTemplates(templates.map(t => 
        t.template_id === savedTemplate.template_id ? savedTemplate : t
      ));
      
      setLoading(false);
    } catch (err) {
      console.error("Error saving template:", err);
      setError("Failed to save template");
      setLoading(false);
    }
  };

  // Handle sync with Supabase Auth
  const handleSyncWithAuth = async () => {
    if (!currentTemplate) return;
    
    try {
      setSyncing(true);
      await syncTemplateWithAuth(currentTemplate.template_id);
      
      // Refresh the template to get the updated sync status
      const updatedTemplate = await getTemplateById(currentTemplate.template_id);
      setCurrentTemplate(updatedTemplate);
      
      // Update the template in the local state
      setTemplates(templates.map(t => 
        t.template_id === updatedTemplate.template_id ? updatedTemplate : t
      ));
      
      setSyncing(false);
    } catch (err) {
      console.error("Error syncing template with Auth:", err);
      setError("Failed to sync template with Auth");
      setSyncing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Template Preview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.template_id} value={template.template_id}>
                  {template.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {loading && (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

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

          {currentTemplate && !loading && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">Status: </span>
                  <span className={`text-sm ${currentTemplate.synced_with_auth ? 'text-green-500' : 'text-amber-500'}`}>
                    {currentTemplate.synced_with_auth ? 'Synced with Auth' : 'Not synced with Auth'}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSyncWithAuth}
                  disabled={syncing || currentTemplate.synced_with_auth}
                >
                  {syncing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync with Auth
                    </>
                  )}
                </Button>
              </div>

              <Tabs defaultValue="edit" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="edit">
                  <TemplateEditor 
                    template={currentTemplate} 
                    onSave={handleSaveTemplate} 
                  />
                </TabsContent>
                <TabsContent value="preview">
                  <div className="border rounded-md overflow-hidden h-[500px]">
                    <iframe 
                      src={`/api/templates/${currentTemplate.template_id}/html`}
                      className="w-full h-full"
                      title={`Preview of ${currentTemplate.name}`}
                    />
                  </div>
                  <div className="mt-4 flex justify-end">
                    <FullPreview 
                      templatePath={`/api/templates/${currentTemplate.template_id}/html`}
                      templateName={currentTemplate.name}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 