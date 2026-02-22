import { AnimatedGroup } from "@/components/ui/animated-group"
import { TextEffect } from "@/components/ui/text-effect"
import { UploadCloud, SlidersHorizontal, Download } from "lucide-react"

const steps = [
    {
        name: "Upload Images",
        description: "Drop your 'before' and 'after' images securely into the browser. No uploads to our servers—ever.",
        icon: UploadCloud,
    },
    {
        name: "Adjust the Slider",
        description: "Drag the divider to the perfect split point. Customize orientation, labels, and the handle style.",
        icon: SlidersHorizontal,
    },
    {
        name: "Export & Share",
        description: "Export directly to your device as a high-quality image or MP4 ready for social media in one click.",
        icon: Download,
    }
]

export function HowItWorksSection() {
    return (
        <section id="proof" className="py-24 sm:py-32 bg-muted/30">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center mb-16 sm:mb-20">
                    <TextEffect as="h2" preset="fade-in-blur" className="text-base/7 font-semibold text-primary">
                        How it Works
                    </TextEffect>
                    <TextEffect
                        as="p"
                        preset="fade-in-blur"
                        delay={0.2}
                        className="mt-2 text-4xl sm:text-5xl font-semibold tracking-tight text-foreground"
                    >
                        Three steps to perfect comparisons
                    </TextEffect>
                </div>

                <div className="relative mx-auto max-w-5xl">
                    {/* Connecting line for desktop */}
                    <div className="hidden md:block absolute top-[2.5rem] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -z-10" />

                    <AnimatedGroup
                        className="grid grid-cols-1 gap-8 md:grid-cols-3"
                        variants={{
                            container: { visible: { transition: { staggerChildren: 0.2 } } },
                            item: { hidden: { opacity: 0, scale: 0.95, filter: "blur(4px)" }, visible: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 100 } } }
                        }}
                    >
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center text-center group">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-background border border-primary/40 shadow-sm ring-1 ring-primary/20 transition-all duration-300">
                                    <step.icon className="h-8 w-8 text-primary transition-colors" />
                                </div>
                                <h3 className="text-xl font-semibold text-foreground mb-3">{step.name}</h3>
                                <p className="text-muted-foreground leading-relaxed max-w-xs">{step.description}</p>
                            </div>
                        ))}
                    </AnimatedGroup>
                </div>
            </div>
        </section>
    )
}
