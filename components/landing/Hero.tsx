import React from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { HeroContent } from './hero-content'

export default function HeroSection() {
    return (
        <>
            <main className="overflow-hidden border-b border-border">
                <div
                    aria-hidden
                    className="absolute inset-0 isolate hidden opacity-65 contain-strict lg:block">
                    <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
                    <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
                </div>
                <section>
                    <div className="relative pt-24 md:pt-36">
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            delayChildren: 1,
                                        },
                                    },
                                },
                                item: {
                                    hidden: {
                                        opacity: 0,
                                        y: 20,
                                    },
                                    visible: {
                                        opacity: 1,
                                        y: 0,
                                        transition: {
                                            type: 'spring',
                                            bounce: 0.3,
                                            duration: 2,
                                        },
                                    },
                                },
                            }}
                            className="mask-b-from-35% mask-b-to-90% absolute inset-0 top-56 -z-20 lg:top-32">
                            <Image
                                src="/app-preview-darkmode.avif"
                                alt="app preview dark mode"
                                className="hidden size-full dark:block"
                                width="1024"
                                height="600"
                                priority
                            />
                            <Image
                                src="/app-preview-lightmode.avif"
                                alt="app preview light mode"
                                className="size-full dark:hidden"
                                width="1024"
                                height="600"
                                priority
                            />
                        </AnimatedGroup>

                        <div
                            aria-hidden
                            className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"
                        />

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
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="group relative m-auto max-w-5xl px-6">
                        <div className="absolute inset-0 z-10 flex scale-95 items-center justify-center opacity-0 duration-500 group-hover:scale-100 group-hover:opacity-100">
                            <Link
                                href="/auth/signup"
                                className="block text-sm duration-150 hover:opacity-75">
                                <span>Start Creating Now</span>
                                <ChevronRight className="ml-1 inline-block size-3" />
                            </Link>
                        </div>
                        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 transition-all duration-500 group-hover:blur-xs group-hover:opacity-50 md:grid-cols-4 md:gap-12">
                            <div className="flex flex-col items-center text-center">
                                <div className="text-3xl font-bold md:text-4xl">
                                    10K+
                                </div>
                                <div className="text-muted-foreground mt-2 text-sm">Exports created</div>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="text-3xl font-bold md:text-4xl">
                                    5 sec
                                </div>
                                <div className="text-muted-foreground mt-2 text-sm">Average export time</div>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="text-3xl font-bold md:text-4xl">
                                    100%
                                </div>
                                <div className="text-muted-foreground mt-2 text-sm">Client-side processing</div>
                            </div>

                            <div className="flex flex-col items-center text-center">
                                <div className="text-3xl font-bold md:text-4xl">
                                    Free account
                                </div>
                                <div className="text-muted-foreground mt-2 text-sm">Sign up required</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}
