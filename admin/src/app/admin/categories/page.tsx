import type { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import CategoriesList from "@/components/categories/CategoriesList";

export const metadata: Metadata = {
  title: "Categories Management | Vanue Admin",
  description: "Manage categories and their properties",
};

export default function CategoriesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Categories Management" />
      <div className="space-y-6">
        <ComponentCard title="Categories List">
          <CategoriesList />
        </ComponentCard>
      </div>
    </div>
  );
}
