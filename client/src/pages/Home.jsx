import { useNavigate } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Activity, ArrowRight, Stethoscope, UserRound, CalendarDays, CreditCard,
  Shield, Clock, HeartPulse, ChevronRight, Zap, Star, Quote, Phone, MapPin,
  Award, Heart, Baby, Brain, Bone, Eye, Microscope, Thermometer, CheckCircle,
  Play, Users, Hospital, Sparkles, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: i => ({
    opacity: 1, scale: 1,
    transition: { delay: i * 0.05, duration: 0.5, ease: "easeOut" }
  })
};

// Doctor images using pravatar
const doctorImages = [
  "https://i.pravatar.cc/300?img=12",
  "https://i.pravatar.cc/300?img=32",
  "https://i.pravatar.cc/300?img=45",
  "https://i.pravatar.cc/300?img=23",
  "https://i.pravatar.cc/300?img=53",
  "https://i.pravatar.cc/300?img=67"
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Patient",
    image: "https://i.pravatar.cc/100?img=5",
    content: "The care I received was exceptional. The doctors took time to explain everything and made me feel comfortable throughout my treatment.",
    rating: 5
  },
  {
    name: "Mike Chen",
    role: "Patient",
    image: "https://i.pravatar.cc/100?img=11",
    content: "Outstanding service! The booking process was smooth and the doctor was incredibly knowledgeable. Highly recommend MediCare.",
    rating: 5
  },
  {
    name: "Emily Williams",
    role: "Patient",
    image: "https://i.pravatar.cc/100?img=9",
    content: "From scheduling to follow-up, every step was handled with professionalism. The team truly cares about patient well-being.",
    rating: 5
  }
];

const statsData = [
  { label: "Expert Doctors", value: 50, suffix: "+", icon: Stethoscope },
  { label: "Happy Patients", value: 20000, suffix: "+", icon: Heart },
  { label: "Appointments", value: 50000, suffix: "+", icon: CalendarDays },
  { label: "Years Experience", value: 15, suffix: "+", icon: Award }
];

const services = [
  { icon: HeartPulse, name: "Cardiology", desc: "Heart care & treatment", color: "from-red-500/10 to-red-500/5", iconColor: "text-red-600" },
  { icon: Brain, name: "Neurology", desc: "Brain & nervous system", color: "from-purple-500/10 to-purple-500/5", iconColor: "text-purple-600" },
  { icon: Bone, name: "Orthopedics", desc: "Bone & joint care", color: "from-amber-500/10 to-amber-500/5", iconColor: "text-amber-600" },
  { icon: Eye, name: "Ophthalmology", desc: "Eye care & surgery", color: "from-blue-500/10 to-blue-500/5", iconColor: "text-blue-600" },
  { icon: Baby, name: "Pediatrics", desc: "Child healthcare", color: "from-pink-500/10 to-pink-500/5", iconColor: "text-pink-600" },
  { icon: Microscope, name: "Pathology", desc: "Lab & diagnostics", color: "from-emerald-500/10 to-emerald-500/5", iconColor: "text-emerald-600" },
];

const features = [
  {
    icon: Shield,
    title: "Certified Specialists",
    desc: "All our doctors are board-certified with years of experience in their fields.",
    color: "from-emerald-500/10 to-emerald-500/5",
    iconColor: "text-emerald-600"
  },
  {
    icon: Clock,
    title: "24/7 Support",
    desc: "Round-the-clock medical assistance and emergency care when you need it most.",
    color: "from-blue-500/10 to-blue-500/5",
    iconColor: "text-blue-600"
  },
  {
    icon: Hospital,
    title: "Modern Facilities",
    desc: "State-of-the-art equipment and comfortable environment for your care.",
    color: "from-violet-500/10 to-violet-500/5",
    iconColor: "text-violet-600"
  },
  {
    icon: CreditCard,
    title: "Affordable Care",
    desc: "Quality healthcare at transparent pricing with flexible payment options.",
    color: "from-amber-500/10 to-amber-500/5",
    iconColor: "text-amber-600"
  },
  {
    icon: Users,
    title: "Patient-Centered",
    desc: "Your wellbeing is our priority. Personalized care plans for every individual.",
    color: "from-rose-500/10 to-rose-500/5",
    iconColor: "text-rose-600"
  },
  {
    icon: Shield,
    title: "Privacy First",
    desc: "Your medical information is protected with bank-level security and confidentiality.",
    color: "from-cyan-500/10 to-cyan-500/5",
    iconColor: "text-cyan-600"
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [doctorsList, setDoctorsList] = useState([]);
  const [counters, setCounters] = useState(statsData.map(() => 0));
  const [countersVisible, setCountersVisible] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Section refs for scroll animations
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const servicesRef = useRef(null);
  const doctorsRef = useRef(null);
  const featuresRef = useRef(null);
  const testimonialsRef = useRef(null);
  const ctaRef = useRef(null);

  // Scroll-based transforms for hero
  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 600], [1, 0.95]);
  const heroY = useTransform(scrollY, [0, 600], [0, 150]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getDoctors({ available: 'true' });
        setDoctorsList(data?.slice(0, 6) || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  // Stats counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !countersVisible) {
          setCountersVisible(true);
          // Animate each counter
          counters.forEach((_, idx) => {
            const target = statsData[idx].value;
            const duration = 2500;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            const timer = setInterval(() => {
              current += increment;
              if (current >= target) {
                current = target;
                clearInterval(timer);
              }
              setCounters(prev => {
                const newCounters = [...prev];
                newCounters[idx] = Math.floor(current);
                return newCounters;
              });
            }, duration / steps);
          });
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [countersVisible]);

  // Smooth scroll for anchor links
  const handleAnchorClick = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (href?.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-1/4 -left-1/4 w-[900px] h-[900px] rounded-full bg-gradient-to-br from-primary/20 via-blue-500/15 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-1/4 w-[700px] h-[700px] rounded-full bg-gradient-to-bl from-emerald-500/15 via-cyan-500/10 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 30, 0], opacity: [0.08, 0.12, 0.08] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-rose-500/10 to-transparent blur-3xl"
        />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/70 backdrop-blur-2xl border-b border-border/40 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="absolute -inset-1 rounded-2xl bg-primary/20 blur-sm -z-10" />
              </div>
              <span className="font-heading text-2xl font-bold bg-gradient-to-r from-primary via-blue-600 to-violet-600 bg-clip-text text-transparent hidden sm:block">
                MediCare
              </span>
            </motion.div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              {["Home", "Doctors", "Services", "About", "Contact"].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={handleAnchorClick}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group py-2"
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
                </motion.a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden sm:flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/20"
                onClick={() => navigate("/signup")}
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="lg:hidden bg-background border-t border-border/40 px-4 py-4 space-y-3"
          >
            {["Home", "Doctors", "Services", "About", "Contact"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block py-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="flex gap-3 pt-3 border-t border-border/30">
              <Button variant="outline" className="flex-1" onClick={() => navigate("/login")}>
                Sign In
              </Button>
              <Button className="flex-1" onClick={() => navigate("/signup")}>
                Get Started
              </Button>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        </motion.div>

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 via-blue-500/10 to-emerald-500/10 border border-primary/20 text-sm font-medium mb-6 sm:mb-8"
              >
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent font-semibold">
                  Excellence in Healthcare Since 2010
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="font-heading text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extreme-bold text-foreground leading-tight tracking-tight"
              >
                Your Health,
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-blue-600 to-violet-600 bg-clip-text text-transparent">
                    Our Priority
                  </span>
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.8, duration: 1, ease: 'easeOut' }}
                  >
                    <path
                      d="M2 6c50-10 100 0 150-5s100 5 150 0"
                      stroke="hsl(var(--primary))"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                  </motion.svg>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7 }}
                className="text-lg sm:text-xl text-muted-foreground mt-6 leading-relaxed max-w-2xl mx-auto lg:mx-0"
              >
                Experience world-class healthcare with our team of expert specialists.
                Modern facilities, compassionate care, and personalized treatment plans
                designed around your wellbeing.
              </motion.p>

              {/* Feature badges */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
                className="flex flex-wrap justify-center lg:justify-start gap-3 mt-8"
              >
                {[
                  { icon: Award, text: "Certified Doctors", color: "text-amber-600" },
                  { icon: Clock, text: "24/7 Support", color: "text-blue-600" },
                  { icon: Shield, text: "100% Safe", color: "text-emerald-600" },
                  { icon: Users, text: "20K+ Patients", color: "text-violet-600" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-4 py-2 bg-card/80 backdrop-blur-sm rounded-full border border-border/60 shadow-sm"
                  >
                    <item.icon className={`w-4 h-4 ${item.color}`} />
                    <span className="text-sm font-medium">{item.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 mt-10 justify-center lg:justify-start"
              >
                <Button
                  size="lg"
                  className="gap-2 text-base px-8 h-14 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-xl shadow-primary/25 group relative overflow-hidden"
                  onClick={() => navigate("/signup")}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Book Appointment <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 text-base px-8 h-14 border-2 hover:bg-primary/5 group"
                  onClick={() => navigate("/doctors")}
                >
                  <Play className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  Meet Our Doctors
                </Button>
              </motion.div>
            </motion.div>

            {/* Right - Doctor Cards Grid */}
            <motion.div
              initial={{ opacity: 0, x: 80 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
              className="relative hidden lg:block"
            >
              <div className="relative grid grid-cols-2 gap-4 max-w-lg mx-auto">
                {doctorImages.slice(0, 4).map((img, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 0.6 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`relative overflow-hidden rounded-2xl bg-card border border-border/60 p-3 shadow-xl cursor-pointer group ${i === 0 ? 'row-span-2' : ''}`}
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                      <img
                        src={img}
                        alt={`Doctor ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      {i === 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute bottom-3 left-2 right-2"
                        >
                          <p className="text-white text-xs font-semibold">Senior Cardiologist</p>
                        </motion.div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="font-heading font-semibold text-card-foreground text-sm truncate">
                        Dr. {["Sarah Smith", "James Wilson", "Emily Chen", "Michael Brown"][i]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {["Cardiologist", "Neurologist", "Pediatrician", "Orthopedic"][i]}
                      </p>
                    </div>
                    {/* Floating rating badge */}
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center shadow-lg"
                    >
                      <Star className="w-4 h-4 text-white fill-white" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>

              {/* Floating Badges */}
              <motion.div
                animate={{ y: [-10, 10, -10], rotate: [0, 3, -3, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 bg-card rounded-2xl p-4 shadow-2xl border border-border/60"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-heading font-bold text-foreground">Verified</p>
                    <p className="text-xs text-muted-foreground">100% Certified</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ x: [0, 8, 0], y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -top-4 -right-4 bg-card rounded-xl p-3 shadow-xl border border-border/60"
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <HeartPulse className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">24/7</p>
                    <p className="text-xs text-muted-foreground">Emergency</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section ref={statsRef} className="py-16 sm:py-24 px-4 sm:px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-blue-500/5 to-violet-500/5" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Trusted by Thousands
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of satisfied patients who trust MediCare for their healthcare needs
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {statsData.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className="group relative bg-card rounded-2xl border border-border/60 p-6 hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <stat.icon className="w-7 h-7 text-primary" />
                  </div>
                  <motion.p
                    className="text-4xl sm:text-5xl font-bold font-heading text-card-foreground mb-2"
                    initial={{ opacity: 0 }}
                    animate={countersVisible ? { opacity: 1 } : {}}
                  >
                    {counters[i].toLocaleString()}{stat.suffix}
                  </motion.p>
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" ref={servicesRef} className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-muted/10 to-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              Our Services
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Comprehensive Healthcare Services
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              From routine checkups to specialized treatments, we provide complete medical care for you and your family
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {services.map((service, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -10, scale: 1.02 }}
                className={`group relative bg-card rounded-2xl border border-border/60 p-6 hover:shadow-2xl hover:border-primary/30 transition-all duration-300 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <service.icon className={`w-7 h-7 ${service.iconColor}`} />
                  </div>
                  <h3 className="font-heading font-bold text-xl text-card-foreground mb-2">
                    {service.name}
                  </h3>
                  <p className="text-muted-foreground mb-4">{service.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary">Learn more</span>
                    <motion.div
                      whileHover={{ x: 5 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <ArrowRight className="w-4 h-4 text-primary" />
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Top Doctors Section */}
      <section id="doctors" ref={doctorsRef} className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Stethoscope className="w-4 h-4" />
              Meet Our Specialists
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Expert Doctors You Can Trust
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our team of highly qualified and experienced doctors are dedicated to providing you with the best medical care
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {(doctorsList.length > 0 ? doctorsList : []).map((doc, i) => (
              <motion.div
                key={doc._id || i}
                variants={scaleIn}
                whileHover={{ y: -12 }}
                className="group bg-card rounded-2xl border border-border/60 overflow-hidden hover:shadow-2xl hover:border-primary/30 transition-all duration-300"
              >
                <div className="relative h-48 sm:h-56 overflow-hidden bg-gradient-to-br from-primary/10 to-blue-500/10">
                  <motion.img
                    src={doctorImages[i % doctorImages.length]}
                    alt={doc.name || `Doctor ${i + 1}`}
                    className="w-full h-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4">
                    <div className="flex items-center justify-between text-white">
                      <div>
                        <h3 className="font-heading font-bold text-lg leading-tight">{doc.name || `Dr. ${["Smith", "Patel", "Lee", "Garcia", "Wilson", "Mitchell"][i]}`}</h3>
                        <p className="text-sm opacity-90">{doc.specialty || ["Cardiologist", "Dermatologist", "Neurologist", "Pediatrician", "Gynecologist", "Orthopedic"][i]}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold text-foreground">{doc.rating?.toFixed(1) || "4.8"}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{doc.patients?.toLocaleString() || "500+"} patients</span>
                    {doc.available && (
                      <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-pulse" />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {doc.bio || `Experienced ${doc.specialty || "specialist"} with years of practice in providing quality healthcare.`}
                  </p>

                  <Button
                    className="w-full gap-2"
                    variant="outline"
                    onClick={() => navigate("/signup")}
                  >
                    Book Appointment <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center mt-12"
          >
            <Button
              size="lg"
              variant="outline"
              className="gap-2 px-8"
              onClick={() => navigate("/doctors")}
            >
              View All Doctors <ChevronRight className="w-5 h-5" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section id="about" ref={featuresRef} className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-muted/20 to-muted/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Why Choose Us
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              The MediCare Difference
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              We combine cutting-edge technology with compassionate care to deliver an exceptional healthcare experience
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          >
            {features.map((feature, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ scale: 1.03, y: -5 }}
                className={`group relative bg-card rounded-2xl border border-border/60 p-6 hover:shadow-xl transition-all duration-300 overflow-hidden`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <motion.div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    whileHover={{ rotate: 5 }}
                  >
                    <feature.icon className={`w-7 h-7 ${feature.iconColor}`} />
                  </motion.div>
                  <h3 className="font-heading font-bold text-xl text-card-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="contact" ref={testimonialsRef} className="py-20 sm:py-28 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Star className="w-4 h-4" />
              Testimonials
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              What Our Patients Say
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Real stories from real patients about their experience with MediCare
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-card rounded-2xl border border-border/60 p-6 sm:p-8 hover:shadow-xl hover:border-primary/30 transition-all duration-300 relative"
              >
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center">
                  <Quote className="w-5 h-5 text-primary/50" />
                </div>

                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, idx) => (
                    <Star
                      key={idx}
                      className={`w-4 h-4 ${idx < testimonial.rating ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground/20'}`}
                    />
                  ))}
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6 text-sm sm:text-base">
                  "{testimonial.content}"
                </p>

                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary/10"
                  />
                  <div>
                    <p className="font-heading font-semibold text-card-foreground">
                      {testimonial.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" ref={ctaRef} className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-blue-600 to-violet-600 p-8 sm:p-16 text-center shadow-2xl"
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -top-1/2 -left-1/2 w-full h-full bg-white/10 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
              >
                Ready to Experience Better Healthcare?
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-white/90 text-lg mb-8 max-w-2xl mx-auto"
              >
                Join thousands of patients who trust MediCare for their healthcare needs.
                Book your appointment today and take the first step towards better health.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Button
                  size="lg"
                  className="gap-2 px-8 h-14 bg-white text-primary hover:bg-white/90 shadow-xl"
                  onClick={() => navigate("/signup")}
                >
                  Get Started Now <ArrowRight className="w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 px-8 h-14 border-white/30 text-white hover:bg-white/10"
                  onClick={() => navigate("/login")}
                >
                  Sign In
                </Button>
              </motion.div>
            </div>

            {/* Floating decorative elements */}
            <div className="absolute top-8 left-8 opacity-10">
              <Heart className="w-16 h-16 text-white" />
            </div>
            <div className="absolute bottom-8 right-8 opacity-10">
              <Stethoscope className="w-16 h-16 text-white" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="about" className="py-12 sm:py-16 px-4 sm:px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: "Emergency Hotline", desc: "+91 8299431275", color: "bg-red-500/10 text-red-600" },
              { icon: Mail, title: "Email Support", desc: "hexagonsservices@gmail.com", color: "bg-blue-500/10 text-blue-600" },
              { icon: MapPin, title: "Visit Us", desc: "Lucknow, India", color: "bg-emerald-500/10 text-emerald-600" }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border/60 hover:shadow-lg transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-medium text-card-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-background to-muted/30 border-t border-border/50 pt-16 pb-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-heading text-2xl font-bold">MediCare</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your trusted partner in healthcare innovation. We're committed to providing exceptional medical care with cutting-edge technology and compassionate service.
              </p>
              <div className="flex gap-4">
                {['f', 't', 'i', 'l'].map((social, i) => (
                  <a
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-lg bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-all text-sm font-bold"
                  >
                    {social.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {["Home", "Doctors", "Services", "About", "Contact"].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group">
                      <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Our Services</h4>
              <ul className="space-y-3">
                {services.slice(0, 5).map((service) => (
                  <li key={service.name}>
                    <a href="#services" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2 group">
                      <service.icon className="w-3 h-3 group-hover:scale-110 transition-transform" />
                      {service.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Get in Touch</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+91 8299431275</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>hexagonsservices@gmail.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Lucknow, India</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="border-t border-border/50 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>© 2026 MediCare Healthcare. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
