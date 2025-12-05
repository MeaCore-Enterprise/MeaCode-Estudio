'use client';

import { useState, useEffect } from 'react';
import {
  GitBranch,
  GitCommitHorizontal,
  ArrowUp,
  ArrowDown,
  Plus,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useEditor } from '@/contexts/editor-context';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface GitStatus {
  branch: string;
  is_clean: boolean;
  modified_files: string[];
  untracked_files: string[];
  staged_files: string[];
}

interface GitBranch {
  name: string;
  is_current: boolean;
  is_remote: boolean;
}

export default function SourceControlPanel() {
  const { toast } = useToast();
  const { workspaceRoot } = useEditor();
  const [gitStatus, setGitStatus] = useState<GitStatus | null>(null);
  const [branches, setBranches] = useState<GitBranch[]>([]);
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const refreshGitStatus = async () => {
    if (!workspaceRoot) {
      setGitStatus(null);
      setBranches([]);
      return;
    }

    setRefreshing(true);
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const invoke = (window as any).__TAURI__?.invoke;

        // Get status
        const status = await invoke('git_status', { workspacePath: workspaceRoot });
        setGitStatus(status);

        // Get branches
        const branchList = await invoke('git_branches', { workspacePath: workspaceRoot });
        setBranches(branchList);
      }
    } catch (error: any) {
      // Not a git repository or git not available
      if (!error.toString().includes('not a git repository')) {
        console.error('Error refreshing git status:', error);
      }
      setGitStatus(null);
      setBranches([]);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshGitStatus();
    // Refresh every 5 seconds
    const interval = setInterval(refreshGitStatus, 5000);
    return () => clearInterval(interval);
  }, [workspaceRoot]);

  const handleCommit = async () => {
    if (!workspaceRoot || !commitMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a commit message.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const invoke = (window as any).__TAURI__?.invoke;

        // Stage all changes
        await invoke('git_add_files', {
          workspacePath: workspaceRoot,
          files: [],
        });

        // Commit
        await invoke('git_commit', {
          workspacePath: workspaceRoot,
          message: commitMessage,
        });

        toast({
          title: 'Success',
          description: 'Changes committed successfully.',
        });

        setCommitMessage('');
        await refreshGitStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.toString() || 'Failed to commit changes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    if (!workspaceRoot) return;

    setLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const invoke = (window as any).__TAURI__?.invoke;

        await invoke('git_push', {
          workspacePath: workspaceRoot,
          branch: gitStatus?.branch || null,
        });

        toast({
          title: 'Success',
          description: 'Changes pushed successfully.',
        });

        await refreshGitStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.toString() || 'Failed to push changes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePull = async () => {
    if (!workspaceRoot) return;

    setLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const invoke = (window as any).__TAURI__?.invoke;

        await invoke('git_pull', { workspacePath: workspaceRoot });

        toast({
          title: 'Success',
          description: 'Changes pulled successfully.',
        });

        await refreshGitStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.toString() || 'Failed to pull changes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBranchChange = async (branchName: string) => {
    if (!workspaceRoot) return;

    setLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const invoke = (window as any).__TAURI__?.invoke;

        await invoke('git_checkout_branch', {
          workspacePath: workspaceRoot,
          branchName,
        });

        toast({
          title: 'Success',
          description: `Switched to branch ${branchName}.`,
        });

        await refreshGitStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.toString() || 'Failed to switch branch.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBranch = async () => {
    const branchName = prompt('Enter new branch name:');
    if (!branchName || !workspaceRoot) return;

    setLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).__TAURI__) {
        const invoke = (window as any).__TAURI__?.invoke;

        await invoke('git_create_branch', {
          workspacePath: workspaceRoot,
          branchName,
        });

        toast({
          title: 'Success',
          description: `Branch ${branchName} created and checked out.`,
        });

        await refreshGitStatus();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.toString() || 'Failed to create branch.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!workspaceRoot) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-muted-foreground text-center">
          Open a folder to use source control features.
        </p>
      </div>
    );
  }

  if (!gitStatus) {
    return (
      <div className="h-full">
        <header className="border-b p-4 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Source Control</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={refreshGitStatus}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </header>
        <div className="p-4">
          <p className="text-muted-foreground text-center">
            Not a git repository. Initialize git in your workspace to use source control.
          </p>
        </div>
      </div>
    );
  }

  const localBranches = branches.filter((b) => !b.is_remote);
  const currentBranch = branches.find((b) => b.is_current) || { name: gitStatus.branch, is_current: true, is_remote: false };

  return (
    <div className="h-full flex flex-col">
      <header className="border-b p-4 flex items-center justify-between">
        <h2 className="font-semibold text-lg">Source Control</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={refreshGitStatus}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </header>
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Current Branch</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-2">
              <Select
                value={currentBranch.name}
                onValueChange={handleBranchChange}
                disabled={loading}
              >
                <SelectTrigger>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {localBranches.map((branch) => (
                    <SelectItem key={branch.name} value={branch.name}>
                      {branch.name}
                      {branch.is_current && <Badge className="ml-2">Current</Badge>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCreateBranch}
                disabled={loading}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {!gitStatus.is_clean && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Changes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {gitStatus.staged_files.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Staged:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {gitStatus.staged_files.slice(0, 5).map((file, idx) => (
                        <li key={idx} className="truncate">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {gitStatus.modified_files.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Modified:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {gitStatus.modified_files.slice(0, 5).map((file, idx) => (
                        <li key={idx} className="truncate">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {gitStatus.untracked_files.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Untracked:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {gitStatus.untracked_files.slice(0, 5).map((file, idx) => (
                        <li key={idx} className="truncate">
                          {file}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Commit Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Input
                placeholder="Commit message..."
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleCommit();
                  }
                }}
                disabled={loading || gitStatus.is_clean}
              />
              <Button
                className="w-full"
                onClick={handleCommit}
                disabled={loading || !commitMessage.trim() || gitStatus.is_clean}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Committing...
                  </>
                ) : (
                  <>
                    <GitCommitHorizontal className="mr-2 h-4 w-4" /> Commit
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Sync</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={handlePull}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowDown className="mr-2 h-4 w-4" />
                )}
                Pull
              </Button>
              <Button
                variant="outline"
                onClick={handlePush}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="mr-2 h-4 w-4" />
                )}
                Push
              </Button>
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}
