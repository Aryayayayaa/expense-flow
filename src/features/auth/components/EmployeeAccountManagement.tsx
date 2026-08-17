"use client";

import { useState } from "react";

import { updateEmployeeCredentialsAction } from "../actions/account-actions";

type Employee = {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
};

type Props = {
  employees: Employee[];
};

export default function EmployeeAccountManagement({ employees }: Props) {
  const [items, setItems] = useState(employees);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [processing, setProcessing] = useState(false);

  function startEditing(employee: Employee) {
    setEditingId(employee.id);
    setEmail(employee.email);
    setPassword("");
    setMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEmail("");
    setPassword("");
  }

  async function handleSave(employeeId: number) {
    setProcessing(true);
    setMessage("");

    try {
      const result = await updateEmployeeCredentialsAction(employeeId, {
        email,
        password: password || undefined,
      });

      setMessage(result.message);

      if (result.success) {
        setItems((current) =>
          current.map((employee) =>
            employee.id === employeeId
              ? {
                  ...employee,
                  email: email.trim().toLowerCase(),
                }
              : employee,
          ),
        );

        cancelEditing();
      }
    } catch (error) {
      console.error("Employee account update error:", error);
      setMessage("Unable to update employee account.");
    } finally {
      setProcessing(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">No employee accounts found.</p>
      </div>
    );
  }

  return (
    <div>
      {message && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-5 py-4 font-medium text-slate-500">
                  Employee
                </th>

                <th className="px-5 py-4 font-medium text-slate-500">Email</th>

                <th className="px-5 py-4 font-medium text-slate-500">Status</th>

                <th className="px-5 py-4 font-medium text-slate-500">Joined</th>

                <th className="px-5 py-4 text-right font-medium text-slate-500">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {items.map((employee) => {
                const editing = editingId === employee.id;

                return (
                  <tr key={employee.id}>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {employee.name}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        Employee #{employee.id}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      {editing ? (
                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        />
                      ) : (
                        <span className="text-slate-600">{employee.email}</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                          employee.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {employee.isActive ? "Active" : "Deactivated"}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {new Date(employee.createdAt).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {editing ? (
                        <div className="flex flex-col items-end gap-2">
                          <input
                            type="password"
                            value={password}
                            onChange={(event) =>
                              setPassword(event.target.value)
                            }
                            placeholder="New password (optional)"
                            className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                          />

                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={processing}
                              onClick={() => handleSave(employee.id)}
                              className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                            >
                              {processing ? "Saving..." : "Save"}
                            </button>

                            <button
                              type="button"
                              disabled={processing}
                              onClick={cancelEditing}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => startEditing(employee)}
                          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                        >
                          Edit Credentials
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
