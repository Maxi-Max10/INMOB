import PoloApp from "@/src/features/PoloApp";

const sectionRoutes = [
  "login",
  "dashboard",
  "properties",
  "owners",
  "tenants",
  "contracts",
  "payments",
  "expenses",
  "adjustments",
  "maintenance",
  "documents",
  "reports",
  "settings",
  "help",
  "profile",
];

const detailRoutes = [
  ...Array.from({ length: 20 }, (_, index) => `properties/p${index + 1}`),
  ...Array.from({ length: 8 }, (_, index) => `owners/o${index + 1}`),
  ...Array.from({ length: 15 }, (_, index) => `tenants/t${index + 1}`),
  ...Array.from({ length: 10 }, (_, index) => `contracts/c${index + 1}`),
];

export function generateStaticParams() {
  return [...sectionRoutes, ...detailRoutes].map((route) => ({ slug: route.split("/") }));
}

export default function AppRoutePage() {
  return <PoloApp />;
}
