"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Play,
  RefreshCw,
  Eye,
  Keyboard,
  Palette,
  FileText,
  Image,
  Focus,
  Volume2,
} from "lucide-react";
import {
  accessibilityTester,
  ScreenReaderTester,
  type AccessibilityReport,
  type AccessibilityTestResult,
} from "@/lib/accessibility-testing";
import { cn } from "@/lib/utils";

interface AccessibilityValidatorProps {
  targetSelector?: string;
  autoRun?: boolean;
  showDetails?: boolean;
}

export function AccessibilityValidator({
  targetSelector = "body",
  autoRun = false,
  showDetails = true,
}: AccessibilityValidatorProps) {
  const [report, setReport] = useState<AccessibilityReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const runTests = async () => {
    setIsRunning(true);

    // Small delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 500));

    try {
      const container =
        (document.querySelector(targetSelector) as HTMLElement) ||
        document.body;
      const testReport = accessibilityTester.runFullTest(container);

      // Add screen reader tests
      const screenReaderResults = [
        ...ScreenReaderTester.testAnnouncements(container),
        ...ScreenReaderTester.testLandmarks(container),
      ];

      testReport.results.push(...screenReaderResults);

      // Recalculate summary
      const errors = testReport.results.filter(
        (r) => r.severity === "error",
      ).length;
      const warnings = testReport.results.filter(
        (r) => r.severity === "warning",
      ).length;
      const passed = testReport.results.filter((r) => r.passed).length;
      const total = testReport.results.length;

      testReport.summary = { errors, warnings, passed };
      testReport.passed = errors === 0;
      testReport.score =
        total > 0 ? Math.round(((passed + warnings * 0.5) / total) * 100) : 100;

      setReport(testReport);
    } catch (error) {
      console.error("Accessibility test failed:", error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (autoRun) {
      runTests();
    }
  }, [autoRun, targetSelector]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return "default";
    if (score >= 70) return "secondary";
    return "destructive";
  };

  const getSeverityIcon = (severity: AccessibilityTestResult["severity"]) => {
    switch (severity) {
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getCategoryIcon = (rule: string) => {
    if (rule.includes("Contrast")) return <Palette className="h-4 w-4" />;
    if (rule.includes("Keyboard")) return <Keyboard className="h-4 w-4" />;
    if (rule.includes("Non-text Content")) return <Image className="h-4 w-4" />;
    if (rule.includes("Target Size")) return <Focus className="h-4 w-4" />;
    if (rule.includes("Headings")) return <FileText className="h-4 w-4" />;
    if (rule.includes("aria-live") || rule.includes("Bypass"))
      return <Volume2 className="h-4 w-4" />;
    return <Eye className="h-4 w-4" />;
  };

  const getFilteredResults = () => {
    if (!report) return [];

    if (selectedCategory === "all") return report.results;

    return report.results.filter((result) => {
      switch (selectedCategory) {
        case "errors":
          return result.severity === "error";
        case "warnings":
          return result.severity === "warning";
        case "passed":
          return result.passed && result.severity === "info";
        case "contrast":
          return result.rule.includes("Contrast");
        case "keyboard":
          return (
            result.rule.includes("Keyboard") || result.rule.includes("Focus")
          );
        case "aria":
          return (
            result.rule.includes("Name, Role, Value") ||
            result.rule.includes("aria")
          );
        case "forms":
          return (
            result.rule.includes("Labels") || result.rule.includes("Error")
          );
        default:
          return true;
      }
    });
  };

  const categories = [
    { id: "all", label: "All Tests", count: report?.results.length || 0 },
    { id: "errors", label: "Errors", count: report?.summary.errors || 0 },
    { id: "warnings", label: "Warnings", count: report?.summary.warnings || 0 },
    { id: "passed", label: "Passed", count: report?.summary.passed || 0 },
    {
      id: "contrast",
      label: "Color Contrast",
      count:
        report?.results.filter((r) => r.rule.includes("Contrast")).length || 0,
    },
    {
      id: "keyboard",
      label: "Keyboard",
      count:
        report?.results.filter(
          (r) => r.rule.includes("Keyboard") || r.rule.includes("Focus"),
        ).length || 0,
    },
    {
      id: "aria",
      label: "ARIA",
      count:
        report?.results.filter(
          (r) =>
            r.rule.includes("Name, Role, Value") || r.rule.includes("aria"),
        ).length || 0,
    },
    {
      id: "forms",
      label: "Forms",
      count:
        report?.results.filter(
          (r) => r.rule.includes("Labels") || r.rule.includes("Error"),
        ).length || 0,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Accessibility Validator
              </CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                WCAG 2.1 AA compliance testing for {targetSelector}
              </p>
            </div>
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="min-w-[120px]"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Run Tests
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {report && (
          <CardContent>
            <div className="space-y-4">
              {/* Score Overview */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">
                      Accessibility Score
                    </span>
                    <Badge variant={getScoreBadgeVariant(report.score)}>
                      {report.score}%
                    </Badge>
                  </div>
                  <Progress value={report.score} className="w-64" />
                </div>

                <div className="text-right">
                  <div
                    className={cn(
                      "text-3xl font-bold",
                      getScoreColor(report.score),
                    )}
                  >
                    {report.score}%
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {report.passed ? "Compliant" : "Issues Found"}
                  </div>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg bg-red-50 p-3 text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {report.summary.errors}
                  </div>
                  <div className="text-sm text-red-700">Errors</div>
                </div>
                <div className="rounded-lg bg-yellow-50 p-3 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {report.summary.warnings}
                  </div>
                  <div className="text-sm text-yellow-700">Warnings</div>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {report.summary.passed}
                  </div>
                  <div className="text-sm text-green-700">Passed</div>
                </div>
              </div>

              {/* Overall Status */}
              {report.summary.errors === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Great! No critical accessibility errors found.
                    {report.summary.warnings > 0 &&
                      ` Consider addressing ${report.summary.warnings} warning(s) for better accessibility.`}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    {report.summary.errors} critical accessibility error(s)
                    found that need immediate attention.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Detailed Results */}
      {report && showDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>

            {/* Category Filters */}
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={
                    selectedCategory === category.id ? "primary" : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="text-xs"
                >
                  {category.label}
                  {category.count > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {category.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardHeader>

          <CardContent>
            <div className="space-y-3">
              {getFilteredResults().length === 0 ? (
                <div className="text-muted-foreground py-8 text-center">
                  No results found for the selected category.
                </div>
              ) : (
                getFilteredResults().map((result, index) => (
                  <div
                    key={index}
                    className={cn("rounded-lg border-l-4 bg-gray-50 p-4", {
                      "border-l-red-500 bg-red-50": result.severity === "error",
                      "border-l-yellow-500 bg-yellow-50":
                        result.severity === "warning",
                      "border-l-green-500 bg-green-50":
                        result.passed && result.severity === "info",
                      "border-l-blue-500 bg-blue-50":
                        result.severity === "info" && !result.passed,
                    })}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex-shrink-0">
                        {getSeverityIcon(result.severity)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          {getCategoryIcon(result.rule)}
                          <span className="text-muted-foreground text-xs font-medium">
                            {result.rule}
                          </span>
                        </div>

                        <p className="mb-1 text-sm font-medium text-gray-900">
                          {result.message}
                        </p>

                        {result.element && (
                          <div className="text-muted-foreground mt-2 rounded bg-gray-100 p-2 font-mono text-xs">
                            <div>
                              Element: &lt;
                              {result.element.tagName.toLowerCase()}
                            </div>
                            {result.element.className && (
                              <div>Class: {result.element.className}</div>
                            )}
                            {result.element.id && (
                              <div>ID: #{result.element.id}</div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0">
                        <Badge
                          variant={
                            result.severity === "error"
                              ? "destructive"
                              : result.severity === "warning"
                                ? "secondary"
                                : "default"
                          }
                          className="text-xs"
                        >
                          {result.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Accessibility Testing Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-2 flex items-center gap-2 font-semibold">
                <Keyboard className="h-4 w-4" />
                Keyboard Testing
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Tab through all interactive elements</li>
                <li>• Use Enter/Space to activate buttons</li>
                <li>• Use arrow keys in menus and grids</li>
                <li>• Test Escape key to close dialogs</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-2 font-semibold">
                <Volume2 className="h-4 w-4" />
                Screen Reader Testing
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Test with NVDA, JAWS, or VoiceOver</li>
                <li>• Navigate by headings and landmarks</li>
                <li>• Verify form labels are announced</li>
                <li>• Check live region announcements</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-2 font-semibold">
                <Palette className="h-4 w-4" />
                Visual Testing
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Verify color contrast ratios</li>
                <li>• Test with high contrast mode</li>
                <li>• Check focus indicators are visible</li>
                <li>• Ensure text is readable at 200% zoom</li>
              </ul>
            </div>

            <div>
              <h4 className="mb-2 flex items-center gap-2 font-semibold">
                <Focus className="h-4 w-4" />
                Mobile Testing
              </h4>
              <ul className="text-muted-foreground space-y-1 text-sm">
                <li>• Touch targets are at least 44x44px</li>
                <li>• Test with device screen readers</li>
                <li>• Verify swipe gestures work</li>
                <li>• Check orientation changes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
