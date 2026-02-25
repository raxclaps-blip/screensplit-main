import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export type LandingFaq = {
    question: string
    answer: string
}

export const landingFaqs: LandingFaq[] = [
    {
        question: "Do I need an account?",
        answer: "No, you can upload and test out the editor without signing up. However, creating a free account lets you save your projects, build a template library, and generate shareable links.",
    },
    {
        question: "Can I export without a watermark?",
        answer: "Standard free exports include a small unobtrusive watermark. Pro users can remove the watermark completely and apply their own custom logos.",
    },
    {
        question: "How does auto-alignment work?",
        answer: "We analyze the primary subjects and structural geometry of both images. The platform automatically scales and shifts them so the 'Before' seamlessly transitions into the 'After'.",
    },
    {
        question: "Can I swap Before and After?",
        answer: "Yes, you can swap them instantly with a single button click inside the editor toolbar.",
    },
    {
        question: "What formats do you support (HEIC)?",
        answer: "We support JPG, PNG, WEBP, and HEIC files. You can upload directly from your iPhone without needing to convert HEIC files to JPG first.",
    },
    {
        question: "Do you store my images?",
        answer: "All uploads to our backend are private per user. If you don't create an account, images are purged quickly. Nothing is ever shared into a public feed without your explicit action.",
    },
    {
        question: "Can I embed the slider on my website?",
        answer: "Yes. Pro users can generate an iframe snippet to place the interactive slider directly on Webflow, Framer, WordPress, or any custom HTML site.",
    },
    {
        question: "Can I batch export?",
        answer: "Yes, the batch mode (Pro restricted) allows you to upload an entire folder of before/after pairs. Pick one template, and the app will process and ZIP all 50 comparisons at once.",
    },
    {
        question: "Can I make videos/GIFs?",
        answer: "We are currently beta testing video MP4 and GIF exports for the interactive slider animation. It will be rolling out soon to Pro users.",
    },
    {
        question: "What happens if my photos are different sizes?",
        answer: "The editor handles varying aspect ratios easily. The auto-align features will smart-crop the images to ensure they match seamlessly within your chosen export preset dimensions (like 1:1 or 9:16).",
    },
]

export function FAQ() {
    return (
        <section className="py-24 bg-background" id="faq">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">Frequently Asked Questions</h2>
                    <p className="text-lg text-muted-foreground">
                        Everything you need to know about the product and billing.
                    </p>
                </div>

                <Accordion type="single" collapsible className="w-full">
                    {landingFaqs.map((faq, index) => (
                        <AccordionItem key={faq.question} value={`item-${index}`}>
                            <AccordionTrigger className="text-left font-semibold text-lg hover:text-primary transition-colors">
                                {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                                {faq.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    );
}
