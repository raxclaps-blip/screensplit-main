"use client";

import React from "react";
import {
  Palette,
  TrendingUp,
  Code,
  Video,
  DollarSign,
  Bitcoin,
  Home,
  Dumbbell,
  ShoppingBag,
  LucideIcon,
} from "lucide-react";

type UseCaseCardProps = {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  mainTitle: string;
  mainDescription: string;
  items: Array<{ title: string; description: string }>;
};

const UseCaseCard: React.FC<UseCaseCardProps> = ({
  icon: Icon,
  iconColor = "text-primary",
  title,
  mainTitle,
  mainDescription,
  items,
}) => {
  return (
    <article className="relative overflow-hidden rounded-xl md:rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm h-full">
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <div className={`flex-shrink-0 ${iconColor}`}>
            <Icon className="w-7 h-7" strokeWidth={1.5} />
          </div>
          <h3 className="text-xl md:text-2xl font-semibold text-foreground">
            {title}
          </h3>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <div className="mb-2 font-medium text-foreground">
              {mainTitle}
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {mainDescription}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {items.map((item, idx) => (
              <div key={idx} className="rounded-md border border-border bg-muted/30 p-3">
                <div className="mb-1.5 font-medium text-sm text-foreground">
                  {item.title}
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export function UseCasesSection() {
  return (
    <section id="use-cases" className="border-y border-border">
      <div className="mx-auto max-w-7xl flex justify-center py-12 md:py-20 px-4 md:px-6 overflow-hidden border-x border-border">
        <div className="w-full max-w-[1280px] relative z-10">
          {/* Section Header */}
          <div className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-3 md:mb-4 text-foreground">
              Built for everyone
            </h2>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed px-4">
              Trusted by professionals across industries worldwide
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <UseCaseCard
              icon={Palette}
              iconColor="text-purple-500"
              title="For Designers"
              mainTitle="UI/UX Showcases"
              mainDescription="Display redesigns and improvements with clear before & after comparisons"
              items={[
                { title: "Portfolio", description: "Showcase professionally" },
                { title: "Presentations", description: "Impress clients" },
              ]}
            />

            <UseCaseCard
              icon={TrendingUp}
              iconColor="text-green-500"
              title="For Marketers"
              mainTitle="Product Launches"
              mainDescription="Highlight new features and improvements with compelling visual stories"
              items={[
                { title: "Social Media", description: "Engaging content" },
                { title: "Case Studies", description: "Measurable results" },
              ]}
            />

            <UseCaseCard
              icon={Code}
              iconColor="text-blue-500"
              title="For Developers"
              mainTitle="Code Improvements"
              mainDescription="Document refactoring results and performance optimizations visually"
              items={[
                { title: "Documentation", description: "Visual changelogs" },
                { title: "Bug Reports", description: "Show fixes clearly" },
              ]}
            />

            <UseCaseCard
              icon={Video}
              iconColor="text-red-500"
              title="For Content Creators"
              mainTitle="Transformation Stories"
              mainDescription="Share progress, makeovers, and short‑form vertical video stories with your audience"
              items={[
                { title: "Tutorials", description: "Step-by-step results" },
                { title: "Reviews", description: "Compare products" },
              ]}
            />

            <UseCaseCard
              icon={DollarSign}
              iconColor="text-emerald-500"
              title="For Forex Traders"
              mainTitle="Trade Analysis"
              mainDescription="Showcase entry vs exit points, chart setups, and winning trade comparisons"
              items={[
                { title: "Strategy Proof", description: "Display profit results" },
                { title: "Trading Signals", description: "Share setups" },
              ]}
            />

            <UseCaseCard
              icon={Bitcoin}
              iconColor="text-orange-500"
              title="For Crypto Traders"
              mainTitle="Portfolio Growth"
              mainDescription="Visualize wallet balances, DeFi positions, and market timing success stories"
              items={[
                { title: "NFT Flips", description: "Buy vs sell prices" },
                { title: "Token Gains", description: "Track performance" },
              ]}
            />

            <UseCaseCard
              icon={Home}
              iconColor="text-cyan-500"
              title="For Real Estate Agents"
              mainTitle="Property Renovations"
              mainDescription="Highlight staging transformations and renovation value to attract buyers"
              items={[
                { title: "Listings", description: "Before & after" },
                { title: "Virtual Tours", description: "Space potential" },
              ]}
            />

            <UseCaseCard
              icon={Dumbbell}
              iconColor="text-rose-500"
              title="For Fitness Coaches"
              mainTitle="Client Transformations"
              mainDescription="Display dramatic body transformations and progress milestones to inspire clients"
              items={[
                { title: "Progress Tracking", description: "Weekly comparisons" },
                { title: "Testimonials", description: "Prove methods work" },
              ]}
            />

            <UseCaseCard
              icon={ShoppingBag}
              iconColor="text-amber-500"
              title="For E-commerce Sellers"
              mainTitle="Product Photography"
              mainDescription="Compare raw vs enhanced product shots to boost conversion rates"
              items={[
                { title: "A/B Testing", description: "Test listing images" },
                { title: "Brand Story", description: "Product evolution" },
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
