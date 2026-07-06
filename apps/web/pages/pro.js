// pages/pro.js
// Premium pricing and Pro plan page
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { colors } from "@lib/design";
import Navbar from "@components/Navbar";
import Footer from "@components/Footer";

export default function ProPage() {
  const [billingCycle, setBillingCycle] = useState("monthly"); // monthly or yearly
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "$0",
      period: "/forever",
      description: "Get started with intelligence",
      cta: "Get Started",
      ctaLink: "/account/signup",
      features: [
        { name: "Browse all items", included: true },
        { name: "Nova Score access", included: true },
        { name: "Save up to 10 items", included: true },
        { name: "Basic comparisons", included: true },
        { name: "Community features", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Weekly reports", included: false },
        { name: "API access", included: false },
      ],
      popular: false,
    },
    {
      id: "pro",
      name: "Pro",
      price: billingCycle === "monthly" ? "$12" : "$99",
      period: billingCycle === "monthly" ? "/month" : "/year",
      description: "For power users",
      cta: "Start Pro Trial",
      ctaLink: "/checkout/pro",
      features: [
        { name: "Everything in Free", included: true },
        { name: "Unlimited saves", included: true },
        { name: "Advanced comparisons", included: true },
        { name: "Priority support", included: true },
        { name: "Weekly intelligence reports", included: true },
        { name: "Custom categories", included: true },
        { name: "Data export (JSON/CSV)", included: true },
        { name: "API access (limited)", included: true },
      ],
      popular: true,
    },
    {
      id: "team",
      name: "Team",
      price: billingCycle === "monthly" ? "$49" : "$399",
      period: billingCycle === "monthly" ? "/month" : "/year",
      description: "For organizations",
      cta: "Contact Sales",
      ctaLink: "/contact?plan=team",
      features: [
        { name: "Everything in Pro", included: true },
        { name: "Up to 10 team members", included: true },
        { name: "Shared workspaces", included: true },
        { name: "Team analytics", included: true },
        { name: "Advanced API", included: true },
        { name: "Dedicated support", included: true },
        { name: "Custom integrations", included: true },
        { name: "SSO/SAML auth", included: true },
      ],
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Can I cancel anytime?",
      answer:
        "Yes! Cancel your Pro subscription anytime with no questions asked. You'll retain access until the end of your billing period.",
    },
    {
      question: "Do you offer refunds?",
      answer:
        "We offer a 7-day money-back guarantee. If you're not satisfied, contact us for a full refund.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, Mastercard, American Express) and PayPal.",
    },
    {
      question: "Is there a free trial?",
      answer:
        "Yes! Pro users get 14 days free. No credit card required to start.",
    },
    {
      question: "Can I switch plans?",
      answer:
        "Of course. You can upgrade or downgrade at any time. We'll prorate charges fairly.",
    },
    {
      question: "Do you have discounts?",
      answer:
        "Yes. Annual plans save 20%. Contact us for bulk organization discounts.",
    },
  ];

  return (
    <>
      <Head>
        <title>Pro Plans | Intelligence Platform</title>
        <meta
          name="description"
          content="Upgrade to Pro for unlimited access and advanced features"
        />
      </Head>

      <Navbar />

      <div style={{ background: colors.bg, minHeight: "100vh" }}>
        {/* Hero Section */}
        <div
          style={{
            background: `linear-gradient(135deg, ${colors.bg2} 0%, ${colors.bg3} 100%)`,
            padding: "80px 24px",
            borderBottom: `1px solid ${colors.bg3}`,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Background accent */}
          <div
            style={{
              position: "absolute",
              top: -100,
              right: -100,
              width: 400,
              height: 400,
              background: `radial-gradient(circle, ${colors.gold}08, transparent)`,
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: 800,
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
            }}
          >
            <h1
              style={{
                fontSize: "clamp(32px, 6vw, 52px)",
                fontWeight: 900,
                margin: 0,
                marginBottom: 12,
                color: colors.t1,
                letterSpacing: "-0.02em",
              }}
            >
              Simple, Transparent Pricing
            </h1>
            <p
              style={{
                fontSize: 18,
                color: colors.t2,
                margin: 0,
                marginBottom: 32,
              }}
            >
              Choose the plan that fits your needs. Free forever, or upgrade for
              power features.
            </p>

            {/* Billing toggle */}
            <div
              style={{
                display: "inline-flex",
                background: colors.bg2,
                border: `1px solid ${colors.bg3}`,
                borderRadius: 10,
                padding: 4,
              }}
            >
              {["monthly", "yearly"].map((cycle) => (
                <button
                  key={cycle}
                  onClick={() => setBillingCycle(cycle)}
                  style={{
                    padding: "8px 20px",
                    background:
                      billingCycle === cycle ? colors.gold : "transparent",
                    color: billingCycle === cycle ? "#000" : colors.t2,
                    border: "none",
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                >
                  {cycle === "monthly" ? "📅 Monthly" : "📆 Yearly (Save 20%)"}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 24px" }}>
          {/* Pricing cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: 24,
              marginBottom: 80,
            }}
          >
            {plans.map((plan, idx) => (
              <div
                key={plan.id}
                onMouseEnter={() => setSelectedPlan(plan.id)}
                onMouseLeave={() => setSelectedPlan(null)}
                style={{
                  padding: 32,
                  background: plan.popular ? colors.bg3 : colors.bg2,
                  border: `2px solid ${plan.popular ? colors.gold : colors.bg3}`,
                  borderRadius: 16,
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  transform:
                    selectedPlan === plan.id || plan.popular
                      ? "translateY(-8px)"
                      : "translateY(0)",
                  position: "relative",
                }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      padding: "6px 16px",
                      background: colors.gold,
                      color: "#000",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                  <h3
                    style={{
                      fontSize: 24,
                      fontWeight: 900,
                      margin: 0,
                      marginBottom: 8,
                      color: colors.t1,
                    }}
                  >
                    {plan.name}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: colors.t3,
                      margin: 0,
                    }}
                  >
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: "clamp(28px, 6vw, 44px)",
                      fontWeight: 900,
                      color: colors.t1,
                      lineHeight: 1,
                    }}
                  >
                    {plan.price}
                    <span
                      style={{
                        fontSize: 14,
                        color: colors.t3,
                        fontWeight: 600,
                        marginLeft: 4,
                      }}
                    >
                      {plan.period}
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link href={plan.ctaLink}>
                  <a
                    style={{
                      display: "block",
                      padding: 12,
                      background: plan.popular ? colors.gold : colors.bg,
                      color: plan.popular ? "#000" : colors.t1,
                      border: `1px solid ${plan.popular ? colors.gold : colors.bg3}`,
                      borderRadius: 10,
                      textAlign: "center",
                      textDecoration: "none",
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      marginBottom: 24,
                    }}
                    onMouseEnter={(e) => {
                      if (!plan.popular) {
                        e.currentTarget.style.borderColor = colors.gold;
                        e.currentTarget.style.color = colors.gold;
                      } else {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = `0 8px 16px ${colors.gold}40`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!plan.popular) {
                        e.currentTarget.style.borderColor = colors.bg3;
                        e.currentTarget.style.color = colors.t1;
                      } else {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }
                    }}
                  >
                    {plan.cta}
                  </a>
                </Link>

                {/* Features */}
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {plan.features.map((feature, featureIdx) => (
                    <div
                      key={featureIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                        color: feature.included ? colors.t2 : colors.t3,
                        opacity: feature.included ? 1 : 0.6,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          color: feature.included ? colors.green : colors.t3,
                        }}
                      >
                        {feature.included ? "✓" : "✗"}
                      </span>
                      {feature.name}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div style={{ marginBottom: 80 }}>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 900,
                margin: 0,
                marginBottom: 40,
                textAlign: "center",
                color: colors.t1,
              }}
            >
              Frequently Asked Questions
            </h2>

            <div
              style={{
                display: "grid",
                gap: 16,
                maxWidth: 700,
                margin: "0 auto",
              }}
            >
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 20,
                    background: colors.bg2,
                    borderRadius: 12,
                    border: `1px solid ${colors.bg3}`,
                  }}
                >
                  <h4
                    style={{
                      fontSize: 14,
                      fontWeight: 800,
                      margin: 0,
                      marginBottom: 8,
                      color: colors.t1,
                    }}
                  >
                    {faq.question}
                  </h4>
                  <p
                    style={{
                      fontSize: 13,
                      color: colors.t3,
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparison section */}
          <div
            style={{
              padding: 32,
              background: colors.bg2,
              borderRadius: 16,
              border: `1px solid ${colors.bg3}`,
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontSize: 24,
                fontWeight: 900,
                margin: 0,
                marginBottom: 12,
                color: colors.t1,
              }}
            >
              Still unsure?
            </h3>
            <p
              style={{
                fontSize: 14,
                color: colors.t3,
                margin: 0,
                marginBottom: 24,
              }}
            >
              Try Pro free for 14 days. No credit card required.
            </p>
            <Link href="/account/signup">
              <a
                style={{
                  display: "inline-block",
                  padding: "12px 28px",
                  background: colors.gold,
                  color: "#000",
                  borderRadius: 10,
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 16px ${colors.gold}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Start Free Trial
              </a>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
