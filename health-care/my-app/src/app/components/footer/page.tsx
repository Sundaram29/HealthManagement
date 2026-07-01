import { MapPin, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";

type FooterProps = {
  className?: string;
};

export default function Footer({ className = "mt-10" }: FooterProps) {
  return (
    <footer className={`bg-gradient-to-r from-[#2b1a4b] via-[#3b2f6b] to-[#1e3a5f] px-6 pt-14 pb-6 text-white md:px-12 ${className}`}>

      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">

        {/* LOGO + ABOUT */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-purple-300">
            MediCare+
          </h2>

          <p className="text-gray-300 text-sm leading-relaxed">
            Smart healthcare platform to find hospitals, check blood
            availability, and manage appointments easily.
          </p>

          {/* SOCIAL */}
          <div className="flex gap-4 mt-5">
            <Facebook className="hover:text-blue-400 hover:scale-110 transition cursor-pointer" />
            <Instagram className="hover:text-pink-400 hover:scale-110 transition cursor-pointer" />
            <Twitter className="hover:text-sky-400 hover:scale-110 transition cursor-pointer" />
          </div>
        </div>

        {/* FEATURES */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-purple-200">
            Features
          </h3>

          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="hover:text-white cursor-pointer transition">Find Hospitals</li>
            <li className="hover:text-white cursor-pointer transition">Blood Availability</li>
            <li className="hover:text-white cursor-pointer transition">Book Appointment</li>
            <li className="hover:text-white cursor-pointer transition">AI Symptom Checker</li>
          </ul>
        </div>

        {/* SERVICES */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-purple-200">
            Services
          </h3>

          <ul className="space-y-2 text-gray-300 text-sm">
            <li className="hover:text-white cursor-pointer transition">Emergency Care</li>
            <li className="hover:text-white cursor-pointer transition">Cardiology</li>
            <li className="hover:text-white cursor-pointer transition">Neurology</li>
            <li className="hover:text-white cursor-pointer transition">Diagnostics</li>
          </ul>
        </div>

        {/* CONTACT */}
        <div>
          <h3 className="text-lg font-semibold mb-4 text-purple-200">
            Contact
          </h3>

          <div className="space-y-3 text-gray-300 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>New Delhi, India</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone size={16} />
              <span>+91 926 888 0303</span>
            </div>

            <div className="flex items-center gap-2">
              <Mail size={16} />
              <span>support@healthcare.com</span>
            </div>
          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="border-t border-white/10 mt-10 pt-5 text-center text-gray-400 text-sm">
        © 2026 HealthCare+. All rights reserved.
      </div>

    </footer>
  );
}
