# MediCare

MediCare is a unified healthcare platform that helps people find hospitals, check live blood availability, discover doctors, and book appointments from one place.

## Live Demo

Visit the deployed application: **[medicare-user.vercel.app](http://medicare-user.vercel.app/)**

## Main Aim

The main aim of MediCare is to make essential healthcare information easier and faster to access. During a medical emergency, people often lose valuable time calling multiple hospitals, searching for blood, or visiting different websites to find a doctor.

MediCare brings patients, hospitals, doctors, and blood banks onto one connected platform. It gives users a clear way to:

- Check blood availability at any time.
- Find blood by group, component, location, and available units.
- Send a blood request directly to a registered blood bank.
- Find hospitals and doctors.
- Book a doctor for a preferred date and available time slot.
- Track appointments and blood requests.
- Use an AI-assisted symptom checker for initial guidance.

> The AI symptom checker is for general informational guidance only. It does not replace diagnosis or treatment from a qualified medical professional.

## The Problem

Healthcare information is often fragmented. Hospital directories, appointment systems, and blood-bank records usually operate separately. This creates several difficulties:

- Patients cannot easily determine which blood bank currently has the required blood group.
- Blood-bank information found online may be outdated or may not include available units.
- Booking a suitable doctor often requires phone calls or an in-person visit.
- Hospitals and blood banks have no shared place to manage requests and availability.
- In an emergency, delays in finding accurate information can directly affect patient outcomes.

## What Makes MediCare Different?

MediCare is more than a hospital listing or a basic appointment-booking website. Its key difference is the connection between multiple healthcare services.

### Live blood availability

Registered blood banks can manage inventory for different blood groups and components. Users can view the latest availability, number of units, and last-updated information at any time instead of calling every blood bank individually.

### Blood request workflow

Users can request a specific blood group, component, and quantity. Blood banks can review the request and update its status as pending, approved, rejected, or delivered.

### Doctor discovery and booking

Users can compare doctors by hospital, specialty, experience, qualifications, rating, and availability, then book an appointment for a selected date and time.

### One connected healthcare platform

Patients, hospitals, doctors, and blood banks use role-specific accounts and dashboards while working with the same healthcare network.

### AI-assisted guidance

The symptom-checking assistant helps users organize their symptoms and identify an appropriate next step before contacting a healthcare professional.

## Social Benefits

- **Faster emergency response:** Reduces the time spent searching for urgently needed blood.
- **Better use of blood inventory:** Makes available units more visible and helps blood banks respond to demand.
- **Improved healthcare access:** Gives users one place to discover hospitals, doctors, and blood banks.
- **Less unnecessary travel:** Patients can check availability and book appointments before leaving home.
- **Greater transparency:** Availability, request status, appointment status, and service information are easier to track.
- **Support for underserved communities:** A simple online platform can connect patients with healthcare resources beyond their immediate contacts.
- **Better coordination:** Hospitals, doctors, blood banks, and patients can participate in a shared digital workflow.

## Main Features

- User registration, login, and role-based sessions
- Hospital, doctor, and blood-bank portals
- Hospital search and discovery
- Doctor profiles and appointment booking
- Appointment history and status management
- Blood inventory with groups, components, units, and availability
- Blood requests with urgency and status tracking
- AI-assisted symptom checker
- Responsive interface for desktop and mobile devices

## Technology Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js App Router and Route Handlers
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Role-based application sessions
- **Additional services:** Supabase and OpenAI-compatible API integration
- **Deployment:** Vercel

## Run Locally

### Prerequisites

- Node.js 20.19 or newer
- npm
- A PostgreSQL database

### Installation

```bash
git clone <repository-url>
cd health-care/my-app
npm install
```

Create a `.env.local` file:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
AUTH_SECRET="replace-with-a-long-random-secret"

NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""

OPENAI_API_KEY=""
OPENAI_BASE_URL=""
OPENAI_MODEL=""
```

Supabase and AI variables are only required for the features that use those services. Never commit real credentials to Git.

Prepare the database and start the application:

```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Checks

```bash
npm run lint
npm run build
```

Prisma Client is generated automatically after dependency installation, making the project ready for Vercel builds.

## Future Scope

- Notifications for newly available blood units and request updates
- Location-based hospital and blood-bank recommendations
- Emergency ambulance integration
- Verified doctor schedules and telemedicine consultations
- Donor registration and donation reminders
- Multilingual and accessibility support
- Analytics to help identify regional blood shortages

## Vision

MediCare aims to reduce the distance between a person in need and the healthcare resource that can help them. The long-term vision is a transparent, connected healthcare network where finding blood, reaching a hospital, or booking the right doctor takes minutes rather than hours.
