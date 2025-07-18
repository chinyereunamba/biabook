'use client'
import { useState } from "react";
import { AnimatePresence, type Transition, motion } from "motion/react";
import { PaginationDot } from "@/components/application/pagination/pagination-dot";
import { Avatar } from "@/components/ui/avatar";
import { StarIcon } from "lucide-react";

export const TestimonialSimpleCentered01 = () => {
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const reviews = [
    {
      id: 0,
      quote:
        "Love the simplicity of the service and the prompt customer support. We can't imagine working without it.",
      author: {
        name: "Caitlyn King",
        title: "Head of Design, Layers",
        avatarUrl:
          "https://www.untitledui.com/images/avatars/caitlyn-king?fm=webp&q=80",
      },
    },
    {
      id: 1,
      quote:
        "We've been using Untitled to kick start every new project and can't imagine working without it.",
      author: {
        name: "Amélie Laurent",
        title: "Product Manager, Wildcrafted",
        avatarUrl:
          "https://www.untitledui.com/images/avatars/amelie-laurent?fm=webp&q=80",
      },
    },
    {
      id: 2,
      quote:
        "Untitled has saved us thousands of hours of work. We're able to spin up projects and features faster.",
      author: {
        name: "Demi Wilkinson",
        title: "Head of Design, Layers",
        avatarUrl:
          "https://www.untitledui.com/images/avatars/demi-wilkinson?fm=webp&q=80",
      },
    },
  ];

  const transition: Transition = {
    type: "spring",
    duration: 0.8,
  };

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col items-center gap-10">
          <figure className="flex max-w-270 flex-col gap-8 text-center">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.blockquote
                key={currentReviewIndex + "-quote"}
                initial={{
                  opacity: 0,
                  scale: 0.98,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    ...transition,
                    delay: 0.4,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  y: 20,
                  transition: {
                    ...transition,
                    delay: 0.06,
                  },
                }}
                className="text-sm md:text-2xl origin-bottom font-medium text-balance will-change-transform"
              >
                {reviews[currentReviewIndex]?.quote}
              </motion.blockquote>
              <motion.figcaption
                key={currentReviewIndex + "-author"}
                initial={{
                  opacity: 0,
                  scale: 0.98,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    ...transition,
                    delay: 0.5,
                  },
                }}
                exit={{
                  opacity: 0,
                  scale: 0.98,
                  y: 20,
                  transition,
                }}
                className="flex origin-bottom flex-col items-center gap-4 will-change-transform"
              >
                <div className="flex flex-col items-center gap-4">
                  <Avatar
                    src={reviews[currentReviewIndex]?.author.avatarUrl
                    }
                    alt={reviews[currentReviewIndex]?.author.name}
                    size="2xl"
                  />
                  <div className="flex flex-col gap-1">
                    <p className="text-primary text-lg font-semibold">
                      {reviews[currentReviewIndex]?.author.name}
                    </p>
                    <cite className="text-md text-tertiary not-italic">
                      {reviews[currentReviewIndex]?.author.title}
                    </cite>
                  </div>
                </div>
                <motion.div aria-hidden="true" className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <motion.div
                      key={`${currentReviewIndex}-${index}`}
                      initial={{
                        opacity: 0,
                        scale: 0.9,
                        y: 6,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: {
                          ...transition,
                          delay: 0.5 + index * 0.1,
                        },
                      }}
                      exit={{
                        opacity: 0,
                        scale: 0.9,
                        y: 6,
                        transition: {
                          ...transition,
                          delay: 0,
                        },
                      }}
                    >
                      <StarIcon />
                    </motion.div>
                  ))}
                </motion.div>
              </motion.figcaption>
            </AnimatePresence>
          </figure>

          <PaginationDot
            page={currentReviewIndex + 1}
            total={3}
            size="lg"
            onPageChange={(page) => setCurrentReviewIndex(page - 1)}
          />
        </div>
      </div>
    </section>
  );
};
