import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Stethoscope, UserRound, CalendarDays, FileText, CreditCard, Shield, Clock, HeartPulse, ChevronRight, Zap, BarChart3, FileUp, Download, Mail, Image, Users, Bell, Laptop, Database, Cloud, Star, Quote, Play, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: i => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" }
  })
};

const float = {
  animate: { y: [-15, 15, -15] }
};

const features = [
  { icon: Stethoscope, title: "Doctor Management", desc: "Complete doctor profiles with specializations, schedules, and availability tracking", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { icon: UserRound, title: "Patient Records", desc: "Comprehensive patient history, medical records, and visit management", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { icon: CalendarDays, title: "Smart Scheduling", desc: "Online appointment booking with calendar management and reminders", color: "text-violet-500", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  { icon: FileText, title: "PDF Reports", desc: "Generate professional prescriptions, lab reports & discharge summaries", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  { icon: Mail, title: "Email & SMS", desc: "Automated appointment reminders, OTPs, and lab result notifications", color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { icon: Image, title: "File Handling", desc: "Upload, compress, and validate X-rays, lab reports & prescriptions", color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20" },
  { icon: FileUp, title: "Bulk Import", desc: "Import patients, doctors & billing data from Excel/CSV files", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { icon: Download, title: "Export Data", desc: "Export reports and payment history in Excel or CSV format", color: "text-teal-500", bg: "bg-teal-500/10", border: "border-teal-500/20" },
  { icon: CreditCard, title: "Billing & Payments", desc: "Generate invoices, track payments and manage revenue", color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  { icon: BarChart3, title: "Analytics", desc: "Real-time dashboard with insights and performance metrics", color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  { icon: Bell, title: "Notifications", desc: "Stay updated with appointment alerts and system notifications", color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20" },
  { icon: Shield, title: "Secure & HIPAA", desc: "Enterprise-grade security with role-based access control", color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/20" },
];

const stats = [
  { value: "50K+", label: "Patients Served", icon: Users },
  { value: "1,200+", label: "Healthcare Providers", icon: Stethoscope },
  { value: "200K+", label: "Appointments", icon: CalendarDays },
  { value: "99.9%", label: "System Uptime", icon: Cloud },
];

const testimonials = [
  { name: "Dr. Sarah Johnson", role: "Chief Medical Officer", text: "This platform transformed how we manage patient records. The PDF generation alone saves hours every day.", avatar: "SJ" },
  { name: "Mark Williams", role: "Hospital Administrator", text: "The bulk import feature helped us migrate 10,000+ patient records in just a few clicks. Incredible tool!", avatar: "MW" },
  { name: "Emily Chen", role: "IT Director", text: "Security was our top concern. MediCore's role-based access and data encryption gave us full HIPAA compliance.", avatar: "EC" },
];

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-500/20 to-transparent blur-3xl" />
        <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.35, 0.2] }} transition={{ duration: 12, repeat: Infinity }}
          className="absolute -bottom-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-violet-500/20 to-transparent blur-3xl" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" 
          style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      {/* Navbar */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">MediCore</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
              <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Stats</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden sm:flex">
                Sign In
              </Button>
              <Button size="sm" className="gap-2 shadow-lg shadow-primary/20" onClick={() => navigate("/signup")}>
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Trusted by 500+ Healthcare Facilities</span>
              </motion.div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                Modern Healthcare{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-violet-500">
                  Management
                </span>{" "}
                Made Simple
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mt-6 leading-relaxed max-w-xl">
                Streamline your hospital operations with our comprehensive HMS. 
                From patient records to billing, PDF reports to bulk imports — all in one powerful platform.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Button size="lg" className="gap-2 text-base px-8 h-14 shadow-xl shadow-primary/25" onClick={() => navigate("/signup")}>
                  Start Free Trial <ArrowRight className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-14" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>
                  <Play className="w-4 h-4" /> See Features
                </Button>
              </div>

              <div className="flex items-center gap-6 mt-10">
                {[
                  { icon: CheckCircle, text: "No credit card required" },
                  { icon: CheckCircle, text: "14-day free trial" },
                  { icon: CheckCircle, text: "Cancel anytime" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <item.icon className="w-4 h-4 text-green-500" />
                    {item.text}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right Visual */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }} className="relative hidden lg:block">
              {/* Floating Cards */}
              <motion.div animate={float} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 left-10 z-20">
                <Card className="bg-card/95 backdrop-blur-xl border shadow-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Patients Today</p>
                      <p className="text-xs text-muted-foreground">+12% from yesterday</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div animate={float} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-32 right-0 z-10">
                <Card className="bg-card/95 backdrop-blur-xl border shadow-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <CalendarDays className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Appointments</p>
                      <p className="text-xs text-muted-foreground">28 pending</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div animate={float} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-10 left-20 z-30">
                <Card className="bg-card/95 backdrop-blur-xl border shadow-2xl">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-violet-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Reports Generated</p>
                      <p className="text-xs text-muted-foreground">156 this week</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Main Dashboard Preview */}
              <div className="ml-16 rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
                <div className="bg-muted/30 px-4 py-3 border-b border-border/40 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="p-6 bg-gradient-to-br from-muted/20 to-muted/40">
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Patients", value: "12,458", change: "+8%" },
                      { label: "Doctors", value: "156", change: "+3" },
                      { label: "Appointments", value: "2,341", change: "+12%" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-card rounded-xl p-4 border">
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-xs text-green-500">{stat.change}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div key={stat.label} initial="hidden" whileInView="visible" variants={fadeUp}
                viewport={{ once: true }} custom={i} className="text-center">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
                  <stat.icon className="w-7 h-7 text-primary" />
                </div>
                <p className="font-heading text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp} className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">Powerful Features</span>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Everything You Need to Run Your Hospital
            </h2>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto">
              A complete suite of tools designed to streamline every aspect of your healthcare operations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {features.map((feature, i) => (
              <motion.div key={feature.title} initial="hidden" whileInView="visible"
                viewport={{ once: true, margin: "-30px" }} variants={scaleIn}
                className="group bg-card/60 backdrop-blur-sm rounded-2xl border border-border/60 p-6 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="font-heading font-semibold text-base text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 bg-gradient-to-b from-transparent via-muted/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Loved by Healthcare Professionals</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">See what hospital administrators and doctors say about MediCore.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <motion.div key={testimonial.name} initial="hidden" whileInView="visible"
                viewport={{ once: true }} variants={scaleIn} custom={i}
                className="bg-card rounded-2xl border border-border/60 p-6 hover:shadow-lg transition-shadow">
                <Quote className="w-8 h-8 text-primary/30 mb-4" />
                <p className="text-muted-foreground leading-relaxed mb-6">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-blue-600 p-10 sm:p-16 text-center relative overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 0%, transparent 40%), radial-gradient(circle at 80% 70%, white 0%, transparent 40%)' }} />
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 opacity-10" style={{ backgroundImage: 'conic-gradient(from 0deg, transparent, white, transparent)' }} />
          
          <div className="relative z-10">
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Hospital?
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-10">
              Join 500+ healthcare facilities already using MediCore to streamline their operations. 
              Start your free 14-day trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="gap-2 text-base px-10 h-14 bg-white text-primary hover:bg-white/90 shadow-xl"
                onClick={() => navigate("/signup")}>
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 text-base px-10 h-14 border-white/30 text-white hover:bg-white/10"
                onClick={() => navigate("/login")}>
                Schedule Demo
              </Button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-heading text-base font-bold text-foreground">MediCore HMS</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms</a>
              <a href="#" className="hover:text-foreground transition-colors">Support</a>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 MediCore. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
