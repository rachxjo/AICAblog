import type { CategorySlug } from "@/types/database";

export interface CategoryConfig {
  slug: CategorySlug;
  name: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
  seoTitle: string;
  seoDescription: string;
}

export const CATEGORIES: Record<CategorySlug, CategoryConfig> = {
  diabetes: {
    slug: "diabetes",
    name: "Diabetes Research",
    description:
      "Latest research on Type 1, Type 2 diabetes, prediabetes, blood sugar management, and insulin therapy.",
    color: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    icon: "Droplets",
    seoTitle: "Diabetes Research News | MedResearch Blog",
    seoDescription:
      "Stay informed with the latest diabetes research, clinical trials, and treatment breakthroughs.",
  },
  transplant: {
    slug: "transplant",
    name: "Organ Transplant",
    description:
      "Cutting-edge research on kidney, liver, lung, and heart transplants, donor matching, and rejection prevention.",
    color: "text-red-600 dark:text-red-400",
    bgColor: "bg-red-50 dark:bg-red-950",
    icon: "Heart",
    seoTitle: "Organ Transplant News | MedResearch Blog",
    seoDescription:
      "Latest organ transplant research, surgical advances, and transplant outcome studies.",
  },
  "bone-marrow": {
    slug: "bone-marrow",
    name: "Bone Marrow & Stem Cell",
    description:
      "Research on bone marrow transplants, stem cell therapy, leukemia treatment, and hematopoietic advances.",
    color: "text-purple-600 dark:text-purple-400",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    icon: "Dna",
    seoTitle: "Bone Marrow & Stem Cell Research | MedResearch Blog",
    seoDescription:
      "Latest bone marrow transplant and stem cell therapy research, clinical trials, and treatment news.",
  },
  "general-health": {
    slug: "general-health",
    name: "General Health",
    description:
      "Broader health research covering public health, preventive medicine, clinical guidelines, and wellness.",
    color: "text-green-600 dark:text-green-400",
    bgColor: "bg-green-50 dark:bg-green-950",
    icon: "Activity",
    seoTitle: "General Health Research News | MedResearch Blog",
    seoDescription:
      "Evidence-based general health news, public health research, and clinical guideline updates.",
  },
};

export const CATEGORY_SLUGS = Object.keys(CATEGORIES) as CategorySlug[];
