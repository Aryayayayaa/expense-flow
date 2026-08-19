export function getCategoryColor(category: string) {
  switch (category.toLowerCase()) {
    case "office supplies":
      return "bg-green-100 text-green-700";

    case "utilities":
      return "bg-purple-100 text-purple-700";

    case "maintenance & repairs":
      return "bg-pink-100 text-pink-700";

    case "payroll & wages":
      return "bg-orange-100 text-orange-700";

    case "advertisement & marketing":
      return "bg-indigo-100 text-indigo-700";

    case "travel & meals":
      return "bg-red-100 text-red-700";

    case "bills":
      return "bg-blue-100 text-blue-700";

    case "software & subscriptions":
      return "bg-yellow-100 text-yellow-700";

    case "training":
      return "bg-amber-100 text-amber-700";

    case "health insurance":
      return "bg-teal-100 text-teal-700";

    case "Taxes & Licenses":
      return "bg-violet-100 text-violet-700";

    default:
      return "bg-gray-100 text-gray-700";
  }
}
