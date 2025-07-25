"use client";

import React from "react";
import {
  Container,
  Grid,
  GridItem,
  VStack,
  HStack,
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
  BottomSheetFooter,
  BottomSheetTrigger,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerNav,
  DrawerNavItem,
  DrawerTrigger,
} from "@/components/ui/layout";
import { MobileTabs, ScrollableTabs } from "@/components/ui/mobile-tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LayoutTest() {
  const [activeTab, setActiveTab] = React.useState("tab1");
  const [activeScrollTab, setActiveScrollTab] = React.useState("option1");

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      {/* Container Test */}
      <Container size="lg" className="mb-8">
        <VStack spacing="lg">
          <h1 className="text-center text-2xl font-bold">
            Layout Components Test
          </h1>

          {/* Grid Test */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Grid Component</h2>
            <Grid cols={3} gap="md">
              <GridItem>
                <Card className="flex h-24 items-center justify-center p-4">
                  Grid Item 1
                </Card>
              </GridItem>
              <GridItem>
                <Card className="flex h-24 items-center justify-center p-4">
                  Grid Item 2
                </Card>
              </GridItem>
              <GridItem colSpan={2}>
                <Card className="flex h-24 items-center justify-center p-4">
                  Grid Item 3 (Span 2)
                </Card>
              </GridItem>
            </Grid>
          </div>

          {/* Stack Test */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Stack Components</h2>

            <VStack spacing="md" className="mb-6">
              <h3 className="text-lg font-medium">Vertical Stack</h3>
              <Button variant="primary">Button 1</Button>
              <Button variant="secondary">Button 2</Button>
              <Button variant="outline">Button 3</Button>
            </VStack>

            <div>
              <h3 className="mb-2 text-lg font-medium">Horizontal Stack</h3>
              <HStack spacing="md" wrap={true}>
                <Button variant="primary">Action 1</Button>
                <Button variant="secondary">Action 2</Button>
                <Button variant="outline">Action 3</Button>
                <Button variant="ghost">Action 4</Button>
              </HStack>
            </div>
          </div>

          {/* Mobile Tabs Test */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Mobile Tabs</h2>
            <MobileTabs
              tabs={[
                {
                  id: "tab1",
                  label: "Tab 1",
                  content: (
                    <Card className="p-6">
                      <h3 className="mb-2 text-lg font-medium">
                        Tab 1 Content
                      </h3>
                      <p>
                        This is the content for tab 1 with swipe support on
                        mobile.
                      </p>
                    </Card>
                  ),
                },
                {
                  id: "tab2",
                  label: "Tab 2",
                  content: (
                    <Card className="p-6">
                      <h3 className="mb-2 text-lg font-medium">
                        Tab 2 Content
                      </h3>
                      <p>This is the content for tab 2.</p>
                    </Card>
                  ),
                },
                {
                  id: "tab3",
                  label: "Tab 3",
                  content: (
                    <Card className="p-6">
                      <h3 className="mb-2 text-lg font-medium">
                        Tab 3 Content
                      </h3>
                      <p>This is the content for tab 3.</p>
                    </Card>
                  ),
                },
              ]}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              swipeable
            />
          </div>

          {/* Scrollable Tabs Test */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Scrollable Tabs</h2>
            <ScrollableTabs
              tabs={[
                "Option 1",
                "Option 2",
                "Option 3",
                "Option 4",
                "Option 5",
                "Option 6",
              ].map((option, index) => ({
                id: `option${index + 1}`,
                label: option,
              }))}
              activeTab={activeScrollTab}
              onTabChange={setActiveScrollTab}
            />
          </div>

          {/* Mobile Layout Patterns */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">
              Mobile Layout Patterns
            </h2>
            <HStack spacing="md" wrap={true}>
              {/* Bottom Sheet */}
              <BottomSheet>
                <BottomSheetTrigger asChild>
                  <Button variant="primary">Open Bottom Sheet</Button>
                </BottomSheetTrigger>
                <BottomSheetContent size="md">
                  <BottomSheetHeader>
                    <BottomSheetTitle>Bottom Sheet Example</BottomSheetTitle>
                  </BottomSheetHeader>
                  <BottomSheetBody>
                    <p>
                      This is a mobile-optimized bottom sheet with a drag handle
                      and smooth animations.
                    </p>
                    <VStack spacing="md" className="mt-4">
                      <Button variant="outline" fullWidth>
                        Option 1
                      </Button>
                      <Button variant="outline" fullWidth>
                        Option 2
                      </Button>
                      <Button variant="outline" fullWidth>
                        Option 3
                      </Button>
                    </VStack>
                  </BottomSheetBody>
                  <BottomSheetFooter>
                    <Button variant="primary" fullWidth>
                      Confirm
                    </Button>
                  </BottomSheetFooter>
                </BottomSheetContent>
              </BottomSheet>

              {/* Drawer */}
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="secondary">Open Drawer</Button>
                </DrawerTrigger>
                <DrawerContent size="md">
                  <DrawerHeader>
                    <DrawerTitle>Navigation Menu</DrawerTitle>
                  </DrawerHeader>
                  <DrawerBody>
                    <DrawerNav>
                      <DrawerNavItem href="#" active>
                        Dashboard
                      </DrawerNavItem>
                      <DrawerNavItem href="#">Bookings</DrawerNavItem>
                      <DrawerNavItem href="#">Services</DrawerNavItem>
                      <DrawerNavItem href="#">Analytics</DrawerNavItem>
                      <DrawerNavItem href="#">Settings</DrawerNavItem>
                    </DrawerNav>
                  </DrawerBody>
                </DrawerContent>
              </Drawer>
            </HStack>
          </div>

          {/* Container Size Test */}
          <div>
            <h2 className="mb-4 text-xl font-semibold">Container Sizes</h2>
            <VStack spacing="sm">
              <Container size="sm" className="rounded bg-blue-100 p-4">
                Small Container (max-w-2xl)
              </Container>
              <Container size="md" className="rounded bg-green-100 p-4">
                Medium Container (max-w-4xl)
              </Container>
              <Container size="content" className="rounded bg-yellow-100 p-4">
                Content Container (max-w-3xl)
              </Container>
            </VStack>
          </div>
        </VStack>
      </Container>
    </div>
  );
}
