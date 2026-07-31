"use client";

import { useState } from "react";

export default function AddExpenseButton() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <section>
      <button
        className="btn btn-primary px-4 py-2 rounded block mx-auto justify-center w-50"
        style={{ backgroundColor: "#ffffff", color: "black" }}
        onClick={() => setIsFormOpen((previous) => !previous)}
      >
        {isFormOpen ? "Close Form" : "Add Expense"}
      </button>

      {isFormOpen && (
        <div>
          <h2>Add Expense Form</h2>

          <p>The form will be built in the next lessons.</p>
        </div>
      )}
    </section>
  );
}
