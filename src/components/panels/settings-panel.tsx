'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Laptop, Moon, Sun, CreditCard, Cpu } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionPanel } from './subscription-panel';
import { GpuSettingsPanel } from './gpu-settings-panel';

export default function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="h-full flex flex-col">
      <header className="border-b p-4">
        <h2 className="font-semibold text-lg">Settings</h2>
        <p className="text-sm text-muted-foreground">Customize your environment.</p>
      </header>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="gpu">
              <Cpu className="h-4 w-4 mr-2" />
              GPU
            </TabsTrigger>
            <TabsTrigger value="subscription">
              <CreditCard className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="general" className="flex-1 overflow-y-auto m-0 p-4">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Theme</Label>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">
                          <div className="flex items-center gap-2">
                            <Sun className="h-4 w-4" />
                            <span>Light</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dark">
                          <div className="flex items-center gap-2">
                            <Moon className="h-4 w-4" />
                            <span>Dark</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="system">
                          <div className="flex items-center gap-2">
                            <Laptop className="h-4 w-4" />
                            <span>System</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gpu" className="flex-1 overflow-hidden m-0">
          <GpuSettingsPanel />
        </TabsContent>

        <TabsContent value="subscription" className="flex-1 overflow-hidden m-0">
          <SubscriptionPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
