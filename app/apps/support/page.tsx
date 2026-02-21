"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Mail, FileText, HelpCircle, Send } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SupportPage() {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("[v0] Support form submitted:", { subject, message })
    setSubject("")
    setMessage("")
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Support</h1>
        <p className="text-muted-foreground">Get help and find answers to common questions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Help Cards */}
        <div className="space-y-4 lg:col-span-3">
          <h2 className="text-xl font-semibold">Quick Help</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 transition-colors hover:bg-muted/50">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Documentation</h3>
              <p className="mb-4 text-sm text-muted-foreground">Browse our comprehensive guides and tutorials</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View Docs
              </Button>
            </Card>

            <Card className="p-6 transition-colors hover:bg-muted/50">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Community</h3>
              <p className="mb-4 text-sm text-muted-foreground">Join our community forum for discussions</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Join Forum
              </Button>
            </Card>

            <Card className="p-6 transition-colors hover:bg-muted/50">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Email Support</h3>
              <p className="mb-4 text-sm text-muted-foreground">Get help directly from our support team</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Email Us
              </Button>
            </Card>

            <Card className="p-6 transition-colors hover:bg-muted/50">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="mb-2 font-semibold">Video Tutorials</h3>
              <p className="mb-4 text-sm text-muted-foreground">Watch step-by-step video guides</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Watch Videos
              </Button>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How do I create a before/after comparison?</AccordionTrigger>
                <AccordionContent>
                  Navigate to the Screensplit page, upload your before and after images, then customize the layout,
                  labels, and styling. Once satisfied, export your comparison in your preferred format.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>What image formats are supported?</AccordionTrigger>
                <AccordionContent>
                  We support JPEG, PNG, GIF, WEBP, AVIF, and TIFF formats for both input and output. You can convert
                  between any of these formats using our Image Converter tool.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How does the Image Optimizer work?</AccordionTrigger>
                <AccordionContent>
                  The Image Optimizer compresses your images while maintaining visual quality. You can adjust the
                  quality slider to find the perfect balance between file size and image quality, then export in your
                  desired format.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>Is my data secure?</AccordionTrigger>
                <AccordionContent>
                  Yes! All image processing happens directly in your browser. Your images are never uploaded to our
                  servers, ensuring complete privacy and security of your data.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger>Can I use Screensplit for commercial projects?</AccordionTrigger>
                <AccordionContent>
                  Yes, you can use Screensplit for both personal and commercial projects. All images you create are
                  yours to use as you see fit.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>What are the image size limits?</AccordionTrigger>
                <AccordionContent>
                  There are no strict size limits, but very large images may take longer to process. For best
                  performance, we recommend images under 10MB and dimensions under 4000x4000 pixels.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </Card>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Contact Us</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="your@email.com" className="mt-2" required />
              </div>
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="How can we help?"
                  className="mt-2"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue or question..."
                  className="mt-2 min-h-[150px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </form>
          </Card>

          <Card className="mt-4 p-6">
            <h3 className="mb-3 font-semibold">Response Time</h3>
            <p className="text-sm text-muted-foreground">
              We typically respond within 24 hours during business days. For urgent issues, please use our live chat
              support.
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
