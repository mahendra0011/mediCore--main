import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Activity, ArrowRight, Stethoscope, UserRound, CalendarDays, FileText, CreditCard, Shield, Clock, HeartPulse, ChevronRight, Zap, BarChart3, FileUp, Download, Mail, Image, Users, Bell, Laptop, Database, Cloud, Star, Quote, Play, CheckCircle, Phone, Search, MapPin, Award, Heart, Baby, Brain, Bone, Eye, Pills, Microscope, Syringe, Ambulance, Check, Circle, Facebook, Twitter, Instagram, Linkedin, Send, Droplets, TestTube, Thermometer, Xray } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: i => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }
  })
};

const services = [
  { icon: Thermometer, name: "Blood Pressure Check", price: "Rs 100" },
  { icon: Droplets, name: "Blood Sugar Test", price: "Rs 150" },
  { icon: TestTube, name: "Full Blood Count", price: "Rs 300" },
  { icon: Xray, name: "X-Ray Scan", price: "Rs 500" },
  { icon: HeartPulse, name: "ECG Test", price: "Rs 400" },
  { icon: Microscope, name: "Thyroid Panel", price: "Rs 500" },
];

const specialties = [
  { icon: Stethoscope, name: "General Physician", color: "from-emerald-500", count: "45+" },
  { icon: Baby, name: "Gynecologist", color: "from-pink-500", count: "32+" },
  { icon: Heart, name: "Dermatologist", color: "from-rose-500", count: "28+" },
  { icon: Brain, name: "Pediatricians", color: "from-violet-500", count: "25+" },
  { icon: Eye, name: "Neurologist", color: "from-blue-500", count: "20+" },
  { icon: Bone, name: "Gastroenterologist", color: "from-amber-500", count: "18+" },
];

const doctors = [
  { name: "Dr. Richard James", specialty: "General Physician", available: true, rating: 4.9, patients: 1200 },
  { name: "Dr. Emily Larson", specialty: "Gynecologist", available: true, rating: 4.8, patients: 980 },
  { name: "Dr. Sarah Patel", specialty: "Dermatologist", available: true, rating: 4.9, patients: 850 },
  { name: "Dr. Christopher Lee", specialty: "Pediatricians", available: true, rating: 4.7, patients: 720 },
  { name: "Dr. Jennifer Garcia", specialty: "Neurologist", available: true, rating: 4.8, patients: 640 },
  { name: "Dr. Andrew Williams", specialty: "Gastroenterologist", available: true, rating: 4.9, patients: 580 },
  { name: "Dr. Christopher Davis", specialty: "General Physician", available: true, rating: 4.6, patients: 520 },
  { name: "Dr. Timothy White", specialty: "Gynecologist", available: true, rating: 4.8, patients: 480 },
  { name: "Dr. Ava Mitchell", specialty: "Dermatologist", available: true, rating: 4.7, patients: 420 },
  { name: "Dr. Jeffrey King", specialty: "Pediatricians", available: true, rating: 4.9, patients: 380 },
];

const Home = () => {
  const navigate = useNavigate();
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getDoctors({ available: 'true' });
        setDoctorsList(data?.slice(0, 6) || doctors.slice(0, 6));
      } catch (e) {
        setDoctorsList(doctors.slice(0, 6));
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary/20 to-transparent blur-3xl" />
        <motion.div animate={{ scale: [1.2, 1, 1.2], opacity: [0.2, 0.4, 0.2] }} transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/3 -right-1/4 w-[600px] h-[600px] rounded-full bg-gradient-to-bl from-blue-500/20 to-transparent blur-3xl" />
      </div>

      {/* Navbar */}
      <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-2xl border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold">MediCare</span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <a href="#specialties" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Specialties</a>
              <a href="#doctors" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Top Doctors</a>
              <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="hidden sm:flex">
                Sign In
              </Button>
              <Button size="sm" className="gap-2 shadow-lg shadow-primary/20" onClick={() => navigate("/signup")}>
                Book Appointment <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
              <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 text-primary text-sm font-medium mb-6 border border-primary/20">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Premium Healthcare at Your Fingertips</span>
              </motion.div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-[1.1] tracking-tight">
                MediCare
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-violet-500">
                  Healthcare Solutions
                </span>
                At Your Fingertips
              </h1>

              <p className="text-lg sm:text-xl text-muted-foreground mt-6 leading-relaxed max-w-xl">
                Experience world-class healthcare from the comfort of your home. 
                Book appointments with certified specialists, get instant consultations, 
                and manage your health records securely.
              </p>

              {/* Features badges */}
              <div className="flex flex-wrap gap-3 mt-6">
                {[
                  { icon: Award, text: "Certified Specialists" },
                  { icon: Clock, text: "24/7 Availability" },
                  { icon: Shield, text: "Safe & Secure" },
                  { icon: Users, text: "500+ Doctors" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-sm">
                    <item.icon className="w-4 h-4 text-primary" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 mt-8">
                <Button size="lg" className="gap-2 text-base px-8 h-14 shadow-xl shadow-primary/25" onClick={() => navigate("/signup")}>
                  Book Appointment Now <ArrowRight className="w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 h-14">
                  <Phone className="w-4 h-4" /> Emergency Call
                </Button>
              </div>
            </motion.div>

            {/* Right - Hero Image with Doctor Cards */}
            <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }} className="relative hidden lg:block">
              
              {/* Main doctor image background */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-blue-500/10 to-violet-500/10 p-8 min-h-[400px]">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Dr. Sarah Patel", specialty: "Dermatologist", patients: "2,500+", color: "bg-pink-500" },
                    { name: "Dr. James Wilson", specialty: "Cardiologist", patients: "1,800+", color: "bg-red-500" },
                    { name: "Dr. Emily Chen", specialty: "Pediatrician", patients: "1,200+", color: "bg-violet-500" },
                    { name: "Dr. Michael Brown", specialty: "Orthopedic", patients: "900+", color: "bg-amber-500" },
                  ].map((doc, i) => (
                    <motion.div 
                      key={doc.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + i * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 text-center"
                    >
                      <div className={`w-12 h-12 ${doc.color} rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold`}>
                        {doc.name.charAt(0)}
                      </div>
                      <p className="font-semibold text-sm">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.specialty}</p>
                      <p className="text-xs text-primary font-medium">{doc.patients} patients</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Floating badge */}
              <motion.div 
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">Verified Doctors</p>
                    <p className="text-xs text-muted-foreground">100% Certified</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 text-lg gap-3 py-4">
              <Search className="w-5 h-5" /> Find by Speciality
            </Button>
            <Button variant="outline" className="h-16 text-lg gap-3 py-4">
              <MapPin className="w-5 h-5" /> Find by Location
            </Button>
            <Button variant="outline" className="h-16 text-lg gap-3 py-4">
              <CalendarDays className="w-5 h-5" /> Book Appointment
            </Button>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section id="specialties" className="py-20 px-4 sm:px-6 bg-gradient-to-b from-muted/20 to-transparent">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" variants={fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Find by Speciality</h2>
            <p className="text-muted-foreground mt-3">Browse through our extensive list of trusted doctors by specialty</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {specialties.map((spec, i) => (
              <motion.div 
                key={spec.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="bg-card rounded-2xl border border-border/60 p-6 text-center cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${spec.color}/20 flex items-center justify-center mx-auto mb-4`}>
                  <spec.icon className={`w-7 h-7 text-${spec.color.split('-')[1]}-500`} />
                </div>
                <h3 className="font-semibold text-foreground">{spec.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{spec.count} Doctors</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Doctors Section */}
      <section id="doctors" className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" variants={fadeUp} className="text-center mb-14">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Top Doctors to Book</h2>
            <p className="text-muted-foreground mt-3">Simply browse through our extensive list of trusted doctors.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(doctorsList.length > 0 ? doctorsList : doctors).map((doc, i) => (
              <motion.div 
                key={doc.name || i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-2xl border border-border/60 p-5 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-blue-500/30 flex items-center justify-center">
                    <UserRound className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{doc.name}</h3>
                      {doc.available && (
                        <span className="w-2 h-2 rounded-full bg-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{doc.specialty || "General Physician"}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium">{doc.rating || "4.8"}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{doc.patients || "500+"}+ patients</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-4" variant="outline">
                  Book Appointment
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button size="lg" variant="outline" className="gap-2">
              View More Doctors <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-blue-600 p-8 sm:p-12 text-center relative overflow-hidden">
          
          <div className="relative z-10">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              With 100+ Trusted Doctors
            </h2>
            <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
              Our network of certified healthcare professionals is here to provide you with the best care possible.
            </p>
            <Button size="lg" className="gap-2 text-base px-10 h-12 bg-white text-primary hover:bg-white/90 shadow-xl"
              onClick={() => navigate("/signup")}>
              Book Appointment <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>
      </section>

{/* Footer */}
      <footer className="bg-gradient-to-b from-background to-muted/30 border-t border-border/50 pt-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand & About */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <Activity className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="font-heading text-2xl font-bold">MediCare</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                Your trusted partner in healthcare innovation. We're committed to providing exceptional medical care with cutting-edge technology and compassionate service.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+91 8299431275</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>hexagonsservices@gmail.com</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Lucknow, India</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3">
                {["Home", "Doctors", "Services", "Contact", "Appointments", "Medical Records", "Billing", "Emergency"].map((link, i) => (
                  <li key={link}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center gap-2">
                      <ChevronRight className="w-3 h-3" /> {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Our Services */}
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Our Services</h4>
              <ul className="space-y-3">
                {services.map((service, i) => (
                  <li key={service.name}>
                    <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm flex items-center justify-between">
                      <span className="flex items-center gap-2"><service.icon className="w-3 h-3 text-primary" /> {service.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="mt-2 text-xs text-primary font-medium">{services[1].price}</div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-heading text-lg font-semibold mb-4">Stay Connected</h4>
              <p className="text-muted-foreground text-sm mb-4">
                Subscribe for health tips, medical updates, and wellness insights delivered to your inbox.
              </p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Enter your email" 
                  className="bg-background"
                />
                <Button size="icon" className="shrink-0">
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 mt-6">
                {[Facebook, Twitter, Instagram, Linkedin].map((SocialIcon, i) => (
                  <a 
                    key={i}
                    href="#" 
                    className="w-9 h-9 rounded-full bg-muted hover:bg-primary hover:text-white flex items-center justify-center transition-all"
                  >
                    <SocialIcon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-border/50 mt-12 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">© 2026 MediCare Healthcare. All rights reserved.</p>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
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