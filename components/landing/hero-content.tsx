"use client"
import React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextEffect } from '@/components/ui/text-effect'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { authClient } from '@/lib/auth-client'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring',
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
} as const

export function HeroContent() {
    const { data, isPending } = authClient.useSession()
    const isAuthenticated = !isPending && Boolean(data?.user)
    return (
        <div className="mx-auto max-w-7xl px-6">
            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                    <Link
                        href="#features"
                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                        <Sparkles className="size-3.5 text-primary flex-shrink-0" />
                        <span className="text-foreground text-sm">See the difference</span>
                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                <span className="flex size-6">
                                    <ArrowRight className="m-auto size-3" />
                                </span>
                                <span className="flex size-6">
                                    <ArrowRight className="m-auto size-3" />
                                </span>
                            </div>
                        </div>
                    </Link>
                </AnimatedGroup>

                <TextEffect
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    as="h1"
                    className="mx-auto mt-8 max-w-4xl text-balance text-5xl max-md:font-semibold md:text-7xl lg:mt-16 xl:text-[5.25rem]">
                    Before & After, Perfected.
                </TextEffect>
                <TextEffect
                    per="line"
                    preset="fade-in-blur"
                    speedSegment={0.3}
                    delay={0.5}
                    as="p"
                    className="text-muted-foreground mx-auto mt-8 max-w-xl text-balance text-lg">
                    Craft stunning, browser-private, side-by-side comparisons in seconds.
                </TextEffect>

                <AnimatedGroup
                    variants={{
                        container: {
                            visible: {
                                transition: {
                                    staggerChildren: 0.05,
                                    delayChildren: 0.75,
                                },
                            },
                        },
                        ...transitionVariants,
                    }}
                    className="mt-12 flex flex-row items-center justify-center gap-2">
                    {isAuthenticated ? [
                        <div
                            key={1}
                            className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-xl px-5 text-base">
                                <Link href="/apps/screensplit">
                                    <span className="text-nowrap">Open ScreenSplit</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>,
                        <Button
                            key={2}
                            asChild
                            size="lg"
                            variant="ghost"
                            className="h-10.5 rounded-xl px-5">
                            <Link href="/apps/gallery">
                                <span className="text-nowrap">My Gallery</span>
                            </Link>
                        </Button>
                    ] : [
                        <div
                            key={1}
                            className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                            <Button
                                asChild
                                size="lg"
                                className="rounded-xl px-5 text-base">
                                <Link href="/auth/signup">
                                    <span className="text-nowrap">Get Started Free</span>
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>,
                        <Button
                            key={2}
                            asChild
                            size="lg"
                            variant="ghost"
                            className="h-10.5 rounded-xl px-5">
                            <Link href="/apps/screensplit">
                                <span className="text-nowrap">Try it now</span>
                            </Link>
                        </Button>
                    ]}
                </AnimatedGroup>
            </div>
        </div>
    )
}
