import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Download, Edit, LogIn, Share, Upload, WandIcon } from "lucide-react";
import Logo from "../common/Logo";

export default function HowItWorks() {
  return (
    <section id="how-it-works">
      <div className="bg-muted dark:bg-background border-t border-border">
        
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 border-x border-border">
            <div className="mx-auto max-w-lg space-y-6 text-center">
          <h2 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
            How It Works
          </h2>
          <p className="text-muted-foreground mb-16">
            Upload before and after images, customize in the canvas editor, and
            export your comparison ready to share.
          </p>
        </div>
            <div className="mx-auto max-w-5xl px-6">
          <div className="relative mx-auto flex max-w-sm items-center justify-between">
            <div className="space-y-4">
              <IntegrationCard
                position="left-top"
                icon={<LogIn className="size-5" />}
                label="Sign Up"
              />
              <IntegrationCard
                position="left-middle"
                icon={<Upload className="size-5" />}
                label="Upload"
              />
              <IntegrationCard
                position="left-bottom"
                icon={<WandIcon className="size-5" />}
                label="Customize"
              />
            </div>
            <div className="mx-auto my-2 flex w-fit justify-center gap-2">
              <div className="bg-muted relative z-20 rounded-2xl border p-1">
                <IntegrationCard
                  className="shadow-black-950/10 dark:bg-background size-16 border-black/25 shadow-xl dark:border-white/25 dark:shadow-white/10"
                  isCenter={true}
                >
                  <Logo/>
                </IntegrationCard>
              </div>
            </div>
            <div
              role="presentation"
              className="absolute inset-1/3 bg-[radial-gradient(var(--dots-color)_1px,transparent_1px)] opacity-50 [--dots-color:black] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] dark:[--dots-color:white]"
            ></div>

            <div className="space-y-4">
              <IntegrationCard
                position="right-top"
                icon={<Edit className="size-5" />}
                label="Edit"
              />
              <IntegrationCard
                position="right-middle"
                icon={<Download className="size-5" />}
                label="Download"
              />
              <IntegrationCard
                position="right-bottom"
                icon={<Share className="size-5" />}
                label="Share"
              />
            </div>
          </div>
          <div className="mx-auto mt-12 max-w-lg space-y-6 text-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/apps/screensplit">Try It Now</Link>
            </Button>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
}

const IntegrationCard = ({
  children,
  icon,
  label,
  className,
  position,
  isCenter = false,
}: {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  position?:
    | "left-top"
    | "left-middle"
    | "left-bottom"
    | "right-top"
    | "right-middle"
    | "right-bottom";
  isCenter?: boolean;
}) => {
  return (
    <div
      className={cn(
        "bg-secondary relative flex rounded-xl border dark:bg-transparent",
        isCenter ? "size-16" : "h-auto w-18 py-2",
        className
      )}
    >
      <div
        className={cn(
          "relative z-20 m-auto flex flex-col items-center justify-center gap-1"
        )}
      >
        <div className="flex items-center justify-center">
          {icon || children}
        </div>
        {label && (
          <span className="text-muted-foreground text-center text-[10px] font-medium leading-tight">
            {label}
          </span>
        )}
      </div>
      {position && !isCenter && (
        <div
          className={cn(
            "bg-border absolute z-10 h-px",
            position === "left-top" &&
              "left-full top-1/2 w-[130px] origin-left rotate-[25deg]",
            position === "left-middle" &&
              "left-full top-1/2 w-[120px] origin-left",
            position === "left-bottom" &&
              "left-full top-1/2 w-[130px] origin-left rotate-[-25deg]",
            position === "right-top" &&
              "right-full top-1/2 w-[130px] origin-right rotate-[-25deg]",
            position === "right-middle" &&
              "right-full top-1/2 w-[120px] origin-right",
            position === "right-bottom" &&
              "right-full top-1/2 w-[130px] origin-right rotate-[25deg]"
          )}
        />
      )}
    </div>
  );
};
