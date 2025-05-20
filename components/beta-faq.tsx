import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export function BetaFAQ() {
  const faqs = [
    {
      question: "How long will the beta period last?",
      answer:
        "The beta period is expected to last approximately 8 weeks. However, we may extend this period based on feedback and development needs.",
    },
    {
      question: "What are the requirements to join the beta?",
      answer:
        "We're looking for active participants who can commit to using the platform regularly and providing detailed feedback. You'll need a stable internet connection, a device with a camera and microphone for video rooms, and a passion for music and social networking.",
    },
    {
      question: "Will my data be secure during the beta?",
      answer:
        "Yes, we take data security seriously even during beta. All your personal information and interactions are protected with the same security measures we'll use in our final release. However, as with any beta, there may be occasional bugs or issues.",
    },
    {
      question: "How do I provide feedback during the beta?",
      answer:
        "Beta testers will have access to an in-app feedback form, a dedicated Discord channel, and regular survey opportunities. We'll also host weekly feedback sessions where you can speak directly with our development team.",
    },
    {
      question: "Will I get to keep my account after the beta ends?",
      answer:
        "Yes! Your account will transition seamlessly to the public release. Any friends, connections, or content you create during the beta will be preserved.",
    },
    {
      question: "Are there any rewards for beta testers?",
      answer:
        "Active beta testers will receive 3 months of Premium membership for free after launch, exclusive beta tester profile badges, and early access to new features as they're developed.",
    },
  ]

  return (
    <Accordion type="single" collapsible className="max-w-3xl mx-auto">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
          <AccordionContent>{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
