"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  HoverEffect,
  PressEffect,
  RippleEffect,
  AnimatedCounter,
  StaggerAnimation,
  SlideTransition,
  FadeTransition,
  ScaleTransition,
} from "@/components/ui/interactions";
import {
  SwipeGesture,
  LongPress,
  DoubleTap,
  SwipeableCard,
} from "@/components/ui/mobile-gestures";
import { MobileTabs } from "@/components/ui/mobile-tabs";
import {
  LoadingButton,
  Spinner,
  InlineLoading,
} from "@/components/ui/loading-states";
import {
  SuccessFeedback,
  ErrorFeedback,
  WarningFeedback,
  BannerFeedback,
} from "@/components/ui/feedback-states";
import { StepProgress, LoadingProgress } from "@/components/ui/progress";
import {
  SkeletonServiceCard,
  SkeletonText,
  SkeletonCard,
} from "@/components/ui/skeleton";
import { Heart, Star, Trash2, Edit, Share } from "lucide-react";

export function InteractiveDemo() {
  const [showTransition, setShowTransition] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [counter, setCounter] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState("interactions");
  const [showBanner, setShowBanner] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);

  const handleLoadingDemo = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setLoading(false);
  };

  const handleCounterIncrement = () => {
    setCounter((prev) => prev + 10);
  };

  const steps = [
    { id: "1", title: "Select Service", description: "Choose your service" },
    { id: "2", title: "Pick Time", description: "Select date and time" },
    {
      id: "3",
      title: "Enter Details",
      description: "Provide your information",
    },
    { id: "4", title: "Confirm", description: "Review and confirm" },
  ];

  const tabs = [
    {
      id: "interactions",
      label: "Interactions",
      icon: <Heart className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hover Effects</h3>
            <div className="grid grid-cols-2 gap-4">
              <HoverEffect effect="lift">
                <Card className="p-4 text-center">
                  <p className="text-sm">Lift Effect</p>
                </Card>
              </HoverEffect>
              <HoverEffect effect="scale">
                <Card className="p-4 text-center">
                  <p className="text-sm">Scale Effect</p>
                </Card>
              </HoverEffect>
              <HoverEffect effect="glow">
                <Card className="p-4 text-center">
                  <p className="text-sm">Glow Effect</p>
                </Card>
              </HoverEffect>
              <HoverEffect effect="fade">
                <Card className="p-4 text-center">
                  <p className="text-sm">Fade Effect</p>
                </Card>
              </HoverEffect>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Press Effects</h3>
            <div className="grid grid-cols-3 gap-4">
              <PressEffect effect="scale">
                <Button variant="secondary" className="w-full">
                  Scale Press
                </Button>
              </PressEffect>
              <PressEffect effect="opacity">
                <Button variant="secondary" className="w-full">
                  Opacity Press
                </Button>
              </PressEffect>
              <PressEffect effect="shadow">
                <Button variant="secondary" className="w-full">
                  Shadow Press
                </Button>
              </PressEffect>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ripple Effect</h3>
            <RippleEffect className="w-full">
              <Button variant="primary" className="w-full">
                Click for Ripple Effect
              </Button>
            </RippleEffect>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Animated Counter</h3>
            <div className="space-y-4 text-center">
              <AnimatedCounter
                value={counter}
                className="text-primary text-3xl font-bold"
                suffix=" points"
              />
              <Button onClick={handleCounterIncrement}>Add 10 Points</Button>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "gestures",
      label: "Gestures",
      icon: <Star className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Swipe Gestures</h3>
            <SwipeGesture
              onSwipeLeft={() => alert("Swiped left!")}
              onSwipeRight={() => alert("Swiped right!")}
              onSwipeUp={() => alert("Swiped up!")}
              onSwipeDown={() => alert("Swiped down!")}
            >
              <Card className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 text-center">
                <p className="text-lg font-medium">Swipe in any direction</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Try swiping left, right, up, or down
                </p>
              </Card>
            </SwipeGesture>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Long Press</h3>
            <LongPress onLongPress={() => alert("Long pressed!")}>
              <Card className="bg-gradient-to-r from-green-50 to-blue-50 p-6 text-center">
                <p className="text-lg font-medium">Long Press Me</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Hold for 500ms
                </p>
              </Card>
            </LongPress>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Double Tap</h3>
            <DoubleTap
              onDoubleTap={() => alert("Double tapped!")}
              onSingleTap={() => alert("Single tapped!")}
            >
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 text-center">
                <p className="text-lg font-medium">Double Tap Me</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Single or double tap
                </p>
              </Card>
            </DoubleTap>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Swipeable Card</h3>
            <SwipeableCard
              onSwipeLeft={() => alert("Deleted!")}
              onSwipeRight={() => alert("Liked!")}
              leftAction={<Trash2 className="h-5 w-5" />}
              rightAction={<Heart className="h-5 w-5" />}
            >
              <Card className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-full">
                    <Star className="text-primary h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">Swipeable Item</p>
                    <p className="text-muted-foreground text-sm">
                      Swipe left to delete, right to like
                    </p>
                  </div>
                </div>
              </Card>
            </SwipeableCard>
          </div>
        </div>
      ),
    },
    {
      id: "transitions",
      label: "Transitions",
      icon: <Share className="h-4 w-4" />,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Slide Transitions</h3>
            <div className="space-y-4">
              <Button
                onClick={() => setShowTransition(!showTransition)}
                variant="secondary"
              >
                Toggle Slide Transition
              </Button>
              <SlideTransition show={showTransition} direction="up">
                <Card className="p-4">
                  <p>This content slides up and down!</p>
                </Card>
              </SlideTransition>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fade Transition</h3>
            <FadeTransition show={showTransition}>
              <Card className="bg-blue-50 p-4">
                <p>This content fades in and out!</p>
              </Card>
            </FadeTransition>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scale Transition</h3>
            <ScaleTransition show={showTransition}>
              <Card className="bg-green-50 p-4">
                <p>This content scales in and out!</p>
              </Card>
            </ScaleTransition>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Stagger Animation</h3>
            <StaggerAnimation delay={150}>
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="mb-2 p-3">
                  <p>Staggered item {i}</p>
                </Card>
              ))}
            </StaggerAnimation>
          </div>
        </div>
      ),
    },
    {
      id: "loading",
      label: "Loading",
      badge: "New",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Loading States</h3>
            <div className="space-y-4">
              <LoadingButton
                loading={loading}
                onClick={handleLoadingDemo}
                className="w-full"
              >
                {loading ? "Loading..." : "Start Loading Demo"}
              </LoadingButton>

              <div className="flex items-center space-x-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>

              <InlineLoading text="Processing..." />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Progress Indicators</h3>
            <StepProgress steps={steps} currentStep={currentStep} />
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
                }
                disabled={currentStep === steps.length - 1}
              >
                Next
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Loading Progress</h3>
            <LoadingProgress message="Uploading files..." progress={65} />
            <LoadingProgress message="Processing..." indeterminate />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Skeleton Loading</h3>
            <SkeletonServiceCard />
            <SkeletonCard />
            <SkeletonText lines={3} />
          </div>
        </div>
      ),
    },
    {
      id: "feedback",
      label: "Feedback",
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Feedback States</h3>
            <div className="space-y-4">
              <SuccessFeedback message="Your booking has been confirmed successfully!" />
              <ErrorFeedback
                message="Unable to process your request. Please try again."
                dismissible
              />
              <WarningFeedback message="Your session will expire in 5 minutes." />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Banner Notifications</h3>
            <Button onClick={() => setShowBanner(true)} variant="secondary">
              Show Banner
            </Button>
            {showBanner && (
              <BannerFeedback
                variant="success"
                message="This is a mobile-optimized banner notification!"
                onDismiss={() => setShowBanner(false)}
              />
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Interactive Components Demo</h1>
        <p className="text-muted-foreground">
          Explore mobile-first interactions, gestures, and animations
        </p>
      </div>

      <MobileTabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        swipeable
        variant="pills"
      />
    </div>
  );
}
