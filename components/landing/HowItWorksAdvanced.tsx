"use client";

import React from "react";
import { motion } from "framer-motion";

// Advanced HowItWorks component with connected nodes and animated SVG paths

const steps = [
  {
    title: "Upload Images",
    description: "Drop your before and after images to get started instantly.",
  },
  {
    title: "Customize Layout",
    description: "Choose your layout and adjust styling to match your brand.",
  },
  {
    title: "Add Effects",
    description: "Apply animations, transitions, and professional touches.",
  },
  {
    title: "Export & Share",
    description: "Download as MP4 or image and share everywhere.",
  },
];

export default function HowItWorksAdvanced(): React.ReactElement {
  return (
    <section className="border-y border-border">
    <div className="mx-auto max-w-7xl flex justify-center py-12 md:py-20 px-4 md:px-6 overflow-hidden border-x border-border">
      <div className="w-full max-w-[1280px] relative z-10">
        {/* Section Header */}
        <div className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4 text-foreground">
            How It Works
          </h2>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed px-4">
            Create stunning comparisons in four simple steps
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Vertical connecting line for mobile (step 1 to 4) */}
          <svg
            className="md:hidden absolute left-1/2 top-0 w-[80px] h-full -translate-x-1/2 pointer-events-none"
            viewBox="0 0 80 1200"
            fill="none"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 40 50 Q 10 200, 40 350 Q 70 500, 40 650 Q 10 800, 40 1150"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
              viewport={{ once: true }}
            />
            {/* Connection points at each step for mobile */}
            {[50, 350, 650, 1150].map((cy, idx) => (
              <motion.circle
                key={idx}
                cx="40"
                cy={cy}
                r="3"
                fill="hsl(var(--primary))"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.6 }}
                transition={{ duration: 0.4, delay: 0.8 + idx * 0.2 }}
                viewport={{ once: true }}
              />
            ))}
          </svg>

          {/* Horizontal connecting line for desktop (step 1 to 4) */}
          <svg
            className="hidden md:block absolute top-1/2 left-0 w-full h-[80px] -translate-y-1/2 pointer-events-none"
            viewBox="0 0 1200 80"
            fill="none"
            preserveAspectRatio="none"
          >
            <motion.path
              d="M 50 40 Q 200 10, 350 40 Q 500 70, 650 40 Q 800 10, 1150 40"
              stroke="hsl(var(--border))"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
              initial={{ pathLength: 0, opacity: 0 }}
              whileInView={{ pathLength: 1, opacity: 0.5 }}
              transition={{ duration: 3, delay: 0.5, ease: "easeInOut" }}
              viewport={{ once: true }}
            />
            {/* Connection points at each step for desktop */}
            {[50, 350, 650, 1150].map((cx, idx) => (
              <motion.circle
                key={idx}
                cx={cx}
                cy="40"
                r="3"
                fill="hsl(var(--primary))"
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.6 }}
                transition={{ duration: 0.4, delay: 0.8 + idx * 0.2 }}
                viewport={{ once: true }}
              />
            ))}
          </svg>

          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: i * 0.2 }}
              viewport={{ once: true }}
              className="relative group"
            >

              {/* Step card */}
              <article className="relative overflow-hidden rounded-xl md:rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm h-full">
                {/* Node indicator */}
                <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-2 border-background" />

                <div className="relative flex flex-col items-center justify-center text-center min-h-[280px]">
                  <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 mb-4 md:mb-6 text-lg font-bold text-primary-foreground bg-primary border border-border rounded-full">
                    {i + 1}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-[30ch] mx-auto">
                    {step.description}
                  </p>
                </div>
              </article>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
    </section>
  );
}
