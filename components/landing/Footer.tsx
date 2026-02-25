"use client";

import Link from "next/link";
import { Twitter, Instagram, Github } from "lucide-react";
import Logo from "@/components/common/Logo";

export function Footer() {
    const currentYear = new Date().getFullYear();

    const links = {
        product: [
            { name: "Home", href: "/" },
            { name: "How It Works", href: "#how-it-works" },
        ],
        company: [
            { name: "About", href: "/about" },
            { name: "Contact", href: "/contact" },
        ],
        legal: [
            { name: "Privacy Policy", href: "/privacy" },
            { name: "Terms of Service", href: "/terms" },
        ],
    };

    return (
        <footer className="bg-background border-t pt-16 pb-8">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">

                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link href="#" className="flex items-center gap-2 mb-4 group inline-flex focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md">
                            <Logo size={30} />
                            <span className="font-bold text-xl tracking-tight">Screensplit</span>
                        </Link>
                        <p className="text-muted-foreground mb-6 max-w-xs">
                            The fastest way to build stunning, professional before and after photo comparisons.
                        </p>
                        <div className="flex items-center gap-4">
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1">
                                <span className="sr-only">Twitter</span>
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1">
                                <span className="sr-only">Instagram</span>
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1">
                                <span className="sr-only">GitHub</span>
                                <Github className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-3">
                            {links.product.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 py-0.5 -ml-1">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            {links.company.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 py-0.5 -ml-1">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {links.legal.map((link) => (
                                <li key={link.name}>
                                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm px-1 py-0.5 -ml-1">
                                        {link.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>

                <div className="pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-muted-foreground text-center md:text-left">
                        © {currentYear} Screensplit. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Designed for creators.</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
