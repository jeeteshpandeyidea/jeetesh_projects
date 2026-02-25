import type { Metadata } from "next";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import SubCategoriesList from "@/components/subcategories/SubCategoriesList";

export const metadata: Metadata = {
  title: "SubCategories Management | Vanue Admin",
  description: "Manage Sub categories and their properties",
};

export default function SubCategoriesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="SubCategories Management" />
      <div className="space-y-6">
        <ComponentCard title="SubCategories List">
          <SubCategoriesList />
        </ComponentCard>
      </div>
    </div>
  );
}
