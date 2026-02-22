import Image from 'next/image'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroContent } from './hero-content'

export default function HeroSection() {
    return (
        <>
            <main className="relative isolate overflow-hidden border-b border-border">
                <div
                    aria-hidden
                    className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-100"
                    style={{ backgroundImage: "url('/animated_image.svg')" }}
                />
                <div
                    aria-hidden
                    className="absolute inset-0 z-10 [background:radial-gradient(125%_125%_at_50%_100%,transparent_18%,var(--color-background)_52%)]"
                />
                <div
                    aria-hidden
                    className="absolute inset-0 z-20 hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section className="relative z-30">
                    <div className="relative pt-24 md:pt-36">
                        <HeroContent />

                        <AnimatedGroup>
                            <div className="mask-b-from-55% relative mx-auto mt-8 overflow-hidden px-4 sm:mt-12 md:mt-20">
                                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-6xl overflow-hidden rounded-2xl border p-2 shadow-lg shadow-zinc-950/15 ring-1 sm:p-4">
                                    <Image
                                        className="bg-background aspect-[16/10] w-full relative hidden rounded-xl dark:block sm:rounded-2xl"
                                        src="/app-preview-darkmode.png"
                                        alt="app screen dark mode"
                                        width="1024"
                                        height="600"
                                        priority
                                    />
                                    <Image
                                        className="z-2 border-border/25 aspect-[16/10] w-full relative rounded-xl border dark:hidden sm:rounded-2xl"
                                        src="/app-preview-lightmode.png"
                                        alt="app screen light mode"
                                        width="1024"
                                        height="600"
                                        priority
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
            </main>
        </>
    )
}
