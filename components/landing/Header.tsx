"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/auth/user-nav";
import { authClient } from "@/lib/auth-client";
import Logo from "@/components/common/Logo";

const panelTransition = { type: "spring" as const, stiffness: 380, damping: 32, mass: 0.82 };

const menuContainerVariants = {
    closed: {
        opacity: 0,
        y: -10,
        scale: 0.98,
        transition: { duration: 0.18 },
    },
    open: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            ...panelTransition,
            when: "beforeChildren" as const,
            staggerChildren: 0.055,
        },
    },
};

const menuItemVariants = {
    closed: { opacity: 0, y: 8 },
    open: { opacity: 1, y: 0, transition: { duration: 0.22 } },
};

export function Header() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { data: session, isPending } = authClient.useSession();
    const isAuthenticated = !isPending && Boolean(session?.user);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setMobileMenuOpen(false);
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [mobileMenuOpen]);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Community", href: "/community" },
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
    ];

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? "bg-background/80 backdrop-blur-md border-b"
                : "bg-transparent border-transparent"
                }`}
        >
            <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between relative">
                {/* Logo */}
                <Link
                    href="/"
                    className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                    <Logo size={30} />
                    <span className="font-bold text-lg tracking-tight">Screensplit</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded px-2 py-1"
                        >
                            {link.name}
                        </Link>
                    ))}
                </nav>

                {/* Desktop CTAs */}
                <div className="hidden md:flex items-center gap-4">
                    <ThemeToggle />
                    {isAuthenticated ? (
                        <>
                            <Button asChild className="font-medium">
                                <Link href="/apps/dashboard">Dashboard</Link>
                            </Button>
                            <UserNav />
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" asChild className="font-medium">
                                <Link href="/auth/signin">Sign in</Link>
                            </Button>
                            <Button asChild className="font-medium">
                                <Link href="/auth/signup">Create a Comparison</Link>
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle & Theme Toggle */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <motion.button
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 text-foreground shadow-sm backdrop-blur-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${mobileMenuOpen
                            ? "bg-muted/60"
                            : "bg-background/65 hover:bg-muted/45"
                            }`}
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={mobileMenuOpen}
                        aria-controls="mobile-nav-panel"
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.span
                                key={mobileMenuOpen ? "close" : "open"}
                                initial={{ opacity: 0, scale: 0.7, rotate: -70 }}
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                exit={{ opacity: 0, scale: 0.7, rotate: 70 }}
                                transition={{ duration: 0.18 }}
                                className="inline-flex"
                            >
                                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </motion.span>
                        </AnimatePresence>
                    </motion.button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen ? (
                    <>
                        <motion.button
                            type="button"
                            aria-label="Close mobile menu"
                            className="md:hidden absolute inset-x-0 top-16 z-40 h-[calc(100vh-4rem)] bg-background/45 backdrop-blur-[2px]"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        <motion.div
                            id="mobile-nav-panel"
                            className="md:hidden absolute inset-x-0 top-16 z-50 px-3 sm:px-4"
                            variants={menuContainerVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                        >
                            <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-border/60 bg-background/92 shadow-[0_24px_60px_-34px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/55 to-transparent dark:hidden" />

                                <motion.nav
                                    className="space-y-1.5 px-3 py-3"
                                    variants={menuContainerVariants}
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                >
                                    {navLinks.map((link) => (
                                        <motion.div key={link.name} variants={menuItemVariants}>
                                            <Link
                                                href={link.href}
                                                className="group flex items-center justify-between rounded-xl border border-transparent px-3 py-3 text-sm font-semibold text-foreground transition-all duration-250 hover:border-border/70 hover:bg-muted/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                <span>{link.name}</span>
                                                <ChevronRight className="h-4 w-4 text-muted-foreground transition-all duration-250 group-hover:translate-x-0.5 group-hover:text-primary" />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </motion.nav>

                                <div className="h-px bg-border/80" />

                                <motion.div
                                    className="space-y-2.5 p-3"
                                    variants={menuContainerVariants}
                                    initial="closed"
                                    animate="open"
                                    exit="closed"
                                >
                                    {isAuthenticated ? (
                                        <>
                                            <motion.div variants={menuItemVariants} whileTap={{ scale: 0.985 }}>
                                                <Button asChild className="w-full justify-center rounded-xl text-sm">
                                                    <Link href="/apps/dashboard" onClick={() => setMobileMenuOpen(false)}>
                                                        Dashboard
                                                    </Link>
                                                </Button>
                                            </motion.div>

                                            <motion.div variants={menuItemVariants} whileTap={{ scale: 0.985 }}>
                                                <Button variant="outline" asChild className="w-full justify-center rounded-xl text-sm border-border/70 bg-background/70">
                                                    <Link href="/apps/settings" onClick={() => setMobileMenuOpen(false)}>
                                                        Settings
                                                    </Link>
                                                </Button>
                                            </motion.div>

                                            <motion.div variants={menuItemVariants} whileTap={{ scale: 0.985 }}>
                                                <Button
                                                    variant="ghost"
                                                    className="w-full justify-center rounded-xl text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                                    onClick={async () => {
                                                        await authClient.signOut();
                                                        window.location.href = "/";
                                                    }}
                                                >
                                                    Log out
                                                </Button>
                                            </motion.div>
                                        </>
                                    ) : (
                                        <>
                                            <motion.div variants={menuItemVariants} whileTap={{ scale: 0.985 }}>
                                                <Button variant="outline" asChild className="w-full justify-center rounded-xl text-sm border-border/70 bg-background/70">
                                                    <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                                                        Sign in
                                                    </Link>
                                                </Button>
                                            </motion.div>

                                            <motion.div variants={menuItemVariants} whileTap={{ scale: 0.985 }}>
                                                <Button asChild className="w-full justify-center rounded-xl text-sm">
                                                    <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                                                        Create a Comparison
                                                    </Link>
                                                </Button>
                                            </motion.div>
                                        </>
                                    )}
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                ) : null}
            </AnimatePresence>
        </header>
    );
}
