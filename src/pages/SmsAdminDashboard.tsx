import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MessageSquare, Send, FileText, Plus, Edit, Trash2, ArrowLeft, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface DeliveryLog {
  id: string;
  phone_number: string;
  message_content: string;
  template_type: string | null;
  status: string;
  twilio_message_sid: string | null;
  error_message: string | null;
  created_at: string;
}

interface NotificationTemplate {
  id: string;
  name: string;
  template_type: string;
  message_template: string;
  is_active: boolean;
  created_at: string;
}

const SmsAdminDashboard = () => {
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    template_type: 'vote_confirmation',
    message_template: '',
    is_active: true
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isElectionAuthority } = useAuth();

  useEffect(() => {
    if (!isElectionAuthority) {
      toast({
        title: "Access Denied",
        description: "Only election authorities can access this dashboard.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    loadData();
  }, [isElectionAuthority, navigate, toast]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load delivery logs
      const { data: logs, error: logsError } = await supabase
        .from('sms_delivery_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;
      setDeliveryLogs(logs || []);

      // Load templates
      const { data: temps, error: tempsError } = await supabase
        .from('notification_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (tempsError) throw tempsError;
      setTemplates(temps || []);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('notification_templates')
          .update({
            name: formData.name,
            template_type: formData.template_type,
            message_template: formData.message_template,
            is_active: formData.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingTemplate.id);

        if (error) throw error;

        toast({
          title: "Template Updated",
          description: "Notification template has been updated successfully.",
        });
      } else {
        // Create new template
        const { error } = await supabase
          .from('notification_templates')
          .insert({
            name: formData.name,
            template_type: formData.template_type,
            message_template: formData.message_template,
            is_active: formData.is_active
          });

        if (error) throw error;

        toast({
          title: "Template Created",
          description: "New notification template has been created successfully.",
        });
      }

      setIsDialogOpen(false);
      setEditingTemplate(null);
      setFormData({
        name: '',
        template_type: 'vote_confirmation',
        message_template: '',
        is_active: true
      });
      loadData();
    } catch (error: any) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      template_type: template.template_type,
      message_template: template.message_template,
      is_active: template.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('notification_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Template Deleted",
        description: "Notification template has been deleted successfully.",
      });
      loadData();
    } catch (error: any) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "secondary" | "outline"> = {
      sent: "default",
      delivered: "default",
      failed: "destructive",
      pending: "secondary"
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">SMS Notification Dashboard</h1>
              <p className="text-muted-foreground">Manage SMS delivery and notification templates</p>
            </div>
          </div>
          <Button onClick={loadData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="logs" className="space-y-4">
          <TabsList>
            <TabsTrigger value="logs">
              <Send className="mr-2 h-4 w-4" />
              Delivery Logs
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="mr-2 h-4 w-4" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>SMS Delivery Logs</CardTitle>
                <CardDescription>View the status of all sent SMS notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Phone Number</TableHead>
                      <TableHead>Template</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Message SID</TableHead>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveryLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono">{log.phone_number}</TableCell>
                        <TableCell>{log.template_type || 'N/A'}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.twilio_message_sid || 'N/A'}
                        </TableCell>
                        <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-destructive">
                          {log.error_message || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Notification Templates</CardTitle>
                    <CardDescription>Create and manage SMS notification templates</CardDescription>
                  </div>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button onClick={() => {
                        setEditingTemplate(null);
                        setFormData({
                          name: '',
                          template_type: 'vote_confirmation',
                          message_template: '',
                          is_active: true
                        });
                      }}>
                        <Plus className="mr-2 h-4 w-4" />
                        New Template
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>
                          {editingTemplate ? 'Edit Template' : 'Create New Template'}
                        </DialogTitle>
                        <DialogDescription>
                          Use variables like {`{{voterName}}`} and {`{{electionDate}}`} in your message
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="name">Template Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Vote Confirmation"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="type">Template Type</Label>
                          <Select
                            value={formData.template_type}
                            onValueChange={(value) => setFormData({ ...formData, template_type: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="vote_confirmation">Vote Confirmation</SelectItem>
                              <SelectItem value="registration">Registration</SelectItem>
                              <SelectItem value="election_reminder">Election Reminder</SelectItem>
                              <SelectItem value="results_announcement">Results Announcement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="message">Message Template</Label>
                          <Textarea
                            id="message"
                            value={formData.message_template}
                            onChange={(e) => setFormData({ ...formData, message_template: e.target.value })}
                            placeholder="Hello {{voterName}}, your vote has been recorded..."
                            rows={4}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="active"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          />
                          <Label htmlFor="active">Active</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleSaveTemplate}>
                          {editingTemplate ? 'Update' : 'Create'} Template
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message Preview</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {templates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">{template.name}</TableCell>
                        <TableCell>{template.template_type}</TableCell>
                        <TableCell className="max-w-md truncate">{template.message_template}</TableCell>
                        <TableCell>
                          <Badge variant={template.is_active ? "default" : "secondary"}>
                            {template.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SmsAdminDashboard;
