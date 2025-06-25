"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Rocket,
  CheckCircle,
  AlertTriangle,
  Clock,
  Database,
  Video,
  Globe,
  Users,
  Settings,
  ExternalLink,
  Copy,
  Terminal,
  Zap,
} from "lucide-react";

interface LaunchStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "inProgress" | "complete" | "error";
  estimatedTime: string;
  priority: "critical" | "high" | "medium";
  automated?: boolean;
}

export function LaunchGuide() {
  const [steps, setSteps] = useState<LaunchStep[]>([
    {
      id: "database",
      title: "Setup Database",
      description: "Create tables and sample data in Supabase",
      status: "pending",
      estimatedTime: "2 min",
      priority: "critical",
      automated: true,
    },
    {
      id: "daily-api",
      title: "Configure Daily.co API",
      description: "Add video streaming API key",
      status: "pending",
      estimatedTime: "5 min",
      priority: "critical",
    },
    {
      id: "test-features",
      title: "Test Core Features",
      description: "Verify authentication, matching, and streaming",
      status: "pending",
      estimatedTime: "10 min",
      priority: "high",
    },
    {
      id: "build-production",
      title: "Production Build",
      description: "Test production build locally",
      status: "pending",
      estimatedTime: "3 min",
      priority: "high",
    },
    {
      id: "deploy",
      title: "Deploy to Vercel",
      description: "Deploy your app to production",
      status: "pending",
      estimatedTime: "10 min",
      priority: "critical",
    },
  ]);

  const [isAutoSetup, setIsAutoSetup] = useState(false);
  const [setupLog, setSetupLog] = useState<string[]>([]);

  const updateStepStatus = (stepId: string, status: LaunchStep["status"]) => {
    setSteps((prev) =>
      prev.map((step) => (step.id === stepId ? { ...step, status } : step)),
    );
  };

  const runAutomatedSetup = async () => {
    setIsAutoSetup(true);
    setSetupLog(["🚀 Starting automated setup..."]);

    // Step 1: Database Setup
    updateStepStatus("database", "inProgress");
    setSetupLog((prev) => [...prev, "📊 Setting up database..."]);

    try {
      const dbResponse = await fetch("/api/auto-setup-db", { method: "POST" });
      const dbData = await dbResponse.json();

      if (dbData.success) {
        updateStepStatus("database", "complete");
        setSetupLog((prev) => [...prev, "✅ Database setup completed!"]);
      } else {
        updateStepStatus("database", "error");
        setSetupLog((prev) => [...prev, "❌ Database setup failed"]);
      }
    } catch (error) {
      updateStepStatus("database", "error");
      setSetupLog((prev) => [...prev, "❌ Database setup failed"]);
    }

    // Step 2: Check Daily.co API
    setSetupLog((prev) => [...prev, "🎥 Checking Daily.co API..."]);

    try {
      const healthResponse = await fetch("/api/health");
      const healthData = await healthResponse.json();

      if (
        healthData.checks?.find(
          (c: any) => c.name === "Daily.co API" && c.status === "pass",
        )
      ) {
        updateStepStatus("daily-api", "complete");
        setSetupLog((prev) => [...prev, "✅ Daily.co API is configured!"]);
      } else {
        setSetupLog((prev) => [
          ...prev,
          "⚠️ Daily.co API needs manual configuration",
        ]);
      }
    } catch (error) {
      setSetupLog((prev) => [
        ...prev,
        "⚠️ Could not verify Daily.co API status",
      ]);
    }

    setSetupLog((prev) => [
      ...prev,
      "🎉 Automated setup complete! Continue with manual steps.",
    ]);
    setIsAutoSetup(false);
  };

  const completedSteps = steps.filter(
    (step) => step.status === "complete",
  ).length;
  const totalSteps = steps.length;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  const getStatusIcon = (status: LaunchStep["status"]) => {
    switch (status) {
      case "complete":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "inProgress":
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: LaunchStep["status"]) => {
    switch (status) {
      case "complete":
        return "border-green-500/30 bg-green-900/20";
      case "inProgress":
        return "border-yellow-500/30 bg-yellow-900/20";
      case "error":
        return "border-red-500/30 bg-red-900/20";
      default:
        return "border-white/10 bg-slate-700/30";
    }
  };

  return (
    <Card className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 shadow-2xl">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Rocket className="w-6 h-6 text-purple-400" />
            <div>
              <h2 className="text-2xl font-bold text-white">
                🚀 Launch Your MVP
              </h2>
              <p className="text-white/60 text-sm">
                Follow these steps to get your app live!
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              {progressPercentage}%
            </div>
            <p className="text-white/60 text-sm">
              {completedSteps}/{totalSteps} complete
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={progressPercentage} className="h-3 bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </Progress>
        </div>

        {/* Automated Setup Button */}
        <div className="mb-6 p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-purple-400" />
              <div>
                <h3 className="text-purple-400 font-medium">
                  Quick Start Automation
                </h3>
                <p className="text-purple-300/70 text-sm">
                  Run automated setup for database and basic configuration
                </p>
              </div>
            </div>
            <Button
              onClick={runAutomatedSetup}
              disabled={isAutoSetup}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isAutoSetup ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Auto Setup
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Setup Log */}
        {setupLog.length > 0 && (
          <div className="mb-6 p-4 bg-black/30 rounded-lg">
            <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
              <Terminal className="w-4 h-4" />
              <span>Setup Log</span>
            </h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {setupLog.map((log, index) => (
                <div key={index} className="text-green-400 text-sm font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Launch Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`p-4 rounded-lg border transition-all ${getStatusColor(step.status)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-600 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  {getStatusIcon(step.status)}
                  <div>
                    <h4 className="text-white font-medium">{step.title}</h4>
                    <p className="text-white/70 text-sm">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {step.automated && (
                    <Badge
                      variant="outline"
                      className="text-purple-400 border-purple-500/50"
                    >
                      Auto
                    </Badge>
                  )}
                  <Badge variant="outline" className="text-white/60">
                    {step.estimatedTime}
                  </Badge>
                </div>
              </div>

              {/* Step-specific instructions */}
              {step.id === "daily-api" && step.status !== "complete" && (
                <div className="ml-11 mt-3 space-y-2">
                  <div className="p-3 bg-slate-900/50 rounded text-sm">
                    <p className="text-white/80 mb-2">
                      1. Get your Daily.co API key:
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          window.open("https://daily.co", "_blank")
                        }
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Sign up at Daily.co
                      </Button>
                    </div>
                    <p className="text-white/80 mt-3 mb-1">
                      2. Add to your .env.local file:
                    </p>
                    <div className="bg-black/50 p-2 rounded font-mono text-green-400 text-xs">
                      DAILY_API_KEY=your_api_key_here
                    </div>
                  </div>
                </div>
              )}

              {step.id === "test-features" && step.status !== "complete" && (
                <div className="ml-11 mt-3">
                  <div className="p-3 bg-slate-900/50 rounded text-sm space-y-2">
                    <p className="text-white/80">Test these key features:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { name: "Sign Up/Login", url: "/signup" },
                        { name: "Matchmaking", url: "/matchmaking" },
                        { name: "Go Live", url: "/go-live" },
                        { name: "Browse Rooms", url: "/rooms" },
                      ].map((feature) => (
                        <Button
                          key={feature.name}
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(feature.url, "_blank")}
                          className="text-xs"
                        >
                          {feature.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step.id === "deploy" && step.status !== "complete" && (
                <div className="ml-11 mt-3">
                  <div className="p-3 bg-slate-900/50 rounded text-sm space-y-2">
                    <p className="text-white/80">Deploy with Vercel:</p>
                    <div className="space-y-1 text-white/60">
                      <p>1. Push code to GitHub</p>
                      <p>2. Connect repo to Vercel</p>
                      <p>3. Set environment variables</p>
                      <p>4. Deploy!</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open("https://vercel.com", "_blank")
                      }
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Open Vercel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Success Message */}
        {progressPercentage === 100 && (
          <div className="mt-6 p-6 bg-green-900/20 border border-green-500/30 rounded-lg text-center">
            <Rocket className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-green-400 font-bold text-xl mb-2">
              🎉 Your MVP is Live!
            </h3>
            <p className="text-green-300 mb-4">
              Congratulations! Your Mix & Mingle app is now ready for users.
            </p>
            <div className="flex justify-center space-x-3">
              <Button className="bg-green-600 hover:bg-green-700">
                <Globe className="w-4 h-4 mr-2" />
                View Live App
              </Button>
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Invite Beta Users
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
