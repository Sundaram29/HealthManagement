"use client"
import React, { useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'

const faqs = [
  {
    category: "Appointments",
    items: [
      {
        q: "How do I book an appointment?",
        a: "You can book an appointment online through our website, call us at +91 926 888 0303, or visit the hospital directly. Online booking is available 24/7 and you'll receive a confirmation SMS and email instantly."
      },
      {
        q: "Can I reschedule or cancel my appointment?",
        a: "Yes, you can reschedule or cancel up to 4 hours before your appointment time. Simply call our helpline or use the booking portal. Repeated last-minute cancellations may affect future bookings."
      },
      {
        q: "How early should I arrive before my appointment?",
        a: "We recommend arriving 15–20 minutes early for first visits to complete registration formalities. For follow-up visits, 10 minutes is sufficient."
      },
    ]
  },
  {
    category: "Services & Treatment",
    items: [
      {
        q: "What specialities does the hospital offer?",
        a: "We offer 32+ specialities including Cardiology, Neurology, Oncology, Orthopedics, Dermatology, Gastroenterology, Pediatrics, and many more. Our East Wing specialises in Cardiac, Transplant, and Oncology services."
      },
      {
        q: "Do you offer emergency services?",
        a: "Yes, our Emergency Department operates 24 hours a day, 7 days a week, 365 days a year. We have dedicated trauma bays, ICU facilities, and round-the-clock specialist coverage for all critical conditions."
      },
      {
        q: "Is a second opinion available?",
        a: "Absolutely. We encourage patients to seek second opinions and have a dedicated team to assist with that process. You can request a second opinion consultation through our patient care desk."
      },
    ]
  },
  {
    category: "Insurance & Billing",
    items: [
      {
        q: "Which insurance providers do you accept?",
        a: "We are empanelled with all major insurance providers including Star Health, HDFC Ergo, ICICI Lombard, New India Assurance, United India, and government schemes like CGHS and ECHS. Contact billing for a full list."
      },
      {
        q: "Can I get a cashless treatment facility?",
        a: "Yes, cashless treatment is available for patients covered under insurance policies we are empanelled with. Please carry your insurance card and a valid ID. Our insurance desk will guide you through pre-authorisation."
      },
      {
        q: "Can I get an itemised bill?",
        a: "Yes, itemised bills are available on request from our billing department. You can also download a digital copy from the patient portal within 24 hours of discharge."
      },
    ]
  },
  {
    category: "Visiting & Facilities",
    items: [
      {
        q: "What are the visiting hours?",
        a: "General visiting hours are 11:00 AM – 1:00 PM and 5:00 PM – 7:00 PM daily. ICU and special wards follow restricted timings. One visitor per patient is allowed at a time to maintain a calm environment."
      },
      {
        q: "Is parking available at the hospital?",
        a: "Yes, we have multi-level paid parking available on campus. Valet parking is also available at the main entrance. Differently-abled visitors are provided dedicated parking bays near the entrance."
      },
      {
        q: "Do you have a pharmacy and diagnostic lab on-site?",
        a: "Yes, a 24/7 pharmacy and a fully equipped diagnostic lab are available on the ground floor. Home sample collection for lab tests can also be arranged by calling our helpline."
      },
    ]
  },
]

const FAQItem = ({ q, a }) => {
  const [open, setOpen] = useState(false)

  return (
    <div
      onClick={() => setOpen(!open)}
      style={{
        borderBottom: '1px solid #e5e7eb',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '18px 0',
          gap: '16px',
        }}
      >
        <span
          style={{
            fontSize: '15px',
            fontWeight: 600,
            color: open ? '#0B3C6D' : '#1f2937',
            transition: 'color 0.2s',
            lineHeight: 1.4,
          }}
        >
          {q}
        </span>
        <ChevronDown
          size={20}
          color={open ? '#0B3C6D' : '#6b7280'}
          style={{
            flexShrink: 0,
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
          }}
        />
      </div>

      <div
        style={{
          maxHeight: open ? '300px' : '0px',
          overflow: 'hidden',
          transition: 'max-height 0.35s ease',
        }}
      >
        <p
          style={{
            fontSize: '14px',
            color: '#4b5563',
            lineHeight: 1.75,
            paddingBottom: '18px',
            margin: 0,
          }}
        >
          {a}
        </p>
      </div>
    </div>
  )
}

const FAQ = () => {
  const [activeCategory, setActiveCategory] = useState("Appointments")

  const currentFAQs = faqs.find(f => f.category === activeCategory)?.items || []

  return (
    <section
      id="faq"
      style={{
        padding: '80px 24px',
        background: '#f9fafb',
      }}
    >
      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* HEADING */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#EBF5FF',
              color: '#0B3C6D',
              borderRadius: '999px',
              padding: '6px 16px',
              fontSize: '13px',
              fontWeight: 600,
              marginBottom: '16px',
              letterSpacing: '0.3px',
            }}
          >
            <MessageCircle size={14} />
            Got Questions?
          </div>

          <h2
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#111827',
              margin: '0 0 12px',
            }}
          >
            Frequently Asked Questions
          </h2>

          <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
            Everything you need to know before your visit.
          </p>
        </div>

        {/* CATEGORY TABS */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px',
            justifyContent: 'center',
            marginBottom: '36px',
          }}
        >
          {faqs.map(({ category }) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '9px 20px',
                borderRadius: '999px',
                border: activeCategory === category
                  ? '1.5px solid #0B3C6D'
                  : '1.5px solid #d1d5db',
                background: activeCategory === category ? '#0B3C6D' : 'white',
                color: activeCategory === category ? 'white' : '#374151',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                letterSpacing: '0.2px',
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ CARD */}
        <div
          style={{
            background: 'white',
            borderRadius: '16px',
            padding: '8px 32px 8px',
            boxShadow: '0 1px 16px rgba(0,0,0,0.07)',
            border: '1px solid #f0f0f0',
          }}
        >
          {currentFAQs.map((item, i) => (
            <FAQItem key={i} q={item.q} a={item.a} />
          ))}
        </div>

        {/* BOTTOM CTA */}
        <div
          style={{
            marginTop: '40px',
            textAlign: 'center',
            padding: '28px',
            background: 'linear-gradient(135deg, #0B3C6D, #134e8a)',
            borderRadius: '16px',
            color: 'white',
          }}
        >
          <p style={{ margin: '0 0 16px', fontSize: '16px', opacity: 0.9 }}>
            Still have questions? Our team is here to help.
          </p>
          <a
            href="tel:+919268880303"
            style={{
              display: 'inline-block',
              background: '#1aaf7f',
              color: 'white',
              padding: '12px 28px',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              letterSpacing: '0.3px',
            }}
          >
            Call Us: +91 926 888 0303
          </a>
        </div>

      </div>
    </section>
  )
}

export default FAQ