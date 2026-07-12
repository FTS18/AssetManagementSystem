"use client";

import { useState, useEffect } from "react";

interface OrgSetupProps {
  user: any;
}

export default function OrgSetup({ user }: OrgSetupProps) {
  const [activeTab, setActiveTab] = useState<"departments" | "categories" | "employees">("departments");
  
  // Lists
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  
  // Form values
  const [deptName, setDeptName] = useState("");
  const [deptHeadId, setDeptHeadId] = useState("");
  const [deptParentId, setDeptParentId] = useState("");
  
  const [catName, setCatName] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [resDepts, resEmployees] = await Promise.all([
        fetch("/api/departments"),
        fetch("/api/employees"),
      ]);
      const dataDepts = await resDepts.json();
      const dataEmployees = await resEmployees.json();
      
      setDepartments(dataDepts.departments || []);
      setEmployees(dataEmployees.employees || []);

      // Simulating loading categories from standard data endpoint (we can also map from /api/assets if categories are returned)
      const resAssets = await fetch("/api/assets");
      const dataAssets = await resAssets.json();
      // Extract unique categories from assets or fall back to defaults
      const uniqueCats = Array.from(
        new Set(
          (dataAssets.assets || []).map((a: any) => JSON.stringify(a.category))
        )
      )
        .map((s: any) => JSON.parse(s))
        .filter(Boolean);
      
      if (uniqueCats.length > 0) {
        setCategories(uniqueCats);
      } else {
        setCategories([
          { id: 1, name: "Electronics" },
          { id: 2, name: "Furniture" },
          { id: 3, name: "Vehicles" },
          { id: 4, name: "Office Space" },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: deptName,
          headId: deptHeadId ? parseInt(deptHeadId) : null,
          parentId: deptParentId ? parseInt(deptParentId) : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create department");

      setSuccess(`Department "${deptName}" created successfully`);
      setDeptName("");
      setDeptHeadId("");
      setDeptParentId("");
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteRole = async (employeeId: number, role: string) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/employees/${employeeId}/promote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Promotion failed");

      setSuccess("Employee role updated successfully");
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (user.role !== "Admin") {
    return (
      <div className="erp-card border-red-950/20 bg-red-950/5 text-center p-8">
        <h2 className="text-lg font-bold text-[var(--danger-text)] mb-2">Access Forbidden</h2>
        <p className="text-xs text-[var(--muted)]">
          Only Admin roles have permission to access and modify Organization Setup parameters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div>
        <h1 className="text-xl font-bold tracking-tight mb-1">Organization Setup</h1>
        <p className="text-xs text-[var(--muted)]">Manage departments, custom asset categories, and assign employee roles.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border)]">
        {(["departments", "categories", "employees"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setError("");
              setSuccess("");
            }}
            className={`px-4 py-2 text-xs font-semibold uppercase tracking-wider border-b-2 -mb-[2px] transition-colors ${
              activeTab === tab
                ? "border-[var(--foreground)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 text-xs font-medium border border-red-950/20 bg-red-950/10 text-[var(--danger-text)]">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 text-xs font-medium border border-emerald-950/20 bg-emerald-950/10 text-[var(--success-text)]">
          {success}
        </div>
      )}

      {/* Tab A: Departments */}
      {activeTab === "departments" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">Registered Departments</h2>
            <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Department Head</th>
                    <th>Parent Scope</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4 text-xs text-[var(--muted)]">
                        No departments registered.
                      </td>
                    </tr>
                  ) : (
                    departments.map((dept) => (
                      <tr key={dept.id}>
                        <td className="font-semibold">{dept.name}</td>
                        <td className="text-xs">{dept.head?.name || "Unassigned"}</td>
                        <td className="text-xs text-[var(--muted)]">{dept.parent?.name || "None"}</td>
                        <td>
                          <span className="badge badge-success">Active</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="erp-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider">Create Department</h3>
              <form onSubmit={handleCreateDepartment} className="space-y-4">
                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--muted)]">Name</label>
                  <input
                    type="text"
                    required
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="erp-input"
                    placeholder="e.g. Engineering"
                  />
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--muted)]">Department Head</label>
                  <select
                    value={deptHeadId}
                    onChange={(e) => setDeptHeadId(e.target.value)}
                    className="erp-input"
                  >
                    <option value="">Select Head (Optional)</option>
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[var(--muted)]">Parent Department</label>
                  <select
                    value={deptParentId}
                    onChange={(e) => setDeptParentId(e.target.value)}
                    className="erp-input"
                  >
                    <option value="">Select Parent (Optional)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" disabled={loading} className="erp-btn-primary w-full">
                  Create
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab B: Categories */}
      {activeTab === "categories" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">Asset Categories</h2>
            <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
              <table className="erp-table">
                <thead>
                  <tr>
                    <th>Category ID</th>
                    <th>Name</th>
                    <th>Template Type</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat.id}>
                      <td className="tech-code text-[var(--muted)]">CAT-{String(cat.id).padStart(2, "0")}</td>
                      <td className="font-semibold">{cat.name}</td>
                      <td className="text-xs text-[var(--muted)]">
                        {cat.customFields ? "Custom Fields Defined" : "Standard Schema"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="erp-card space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider">Add New Category</h3>
              <div className="flex flex-col space-y-2">
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="erp-input"
                  placeholder="e.g. Infrastructure"
                />
                <button
                  onClick={() => {
                    if (catName.trim()) {
                      setCategories([...categories, { id: categories.length + 1, name: catName }]);
                      setSuccess(`Category "${catName}" added (Visual preview)`);
                      setCatName("");
                    }
                  }}
                  className="erp-btn-primary w-full"
                >
                  Add Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab C: Employees */}
      {activeTab === "employees" && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--muted)]">Employee Directory</h2>
          <div className="overflow-x-auto border border-[var(--border)] bg-[var(--surface)]">
            <table className="erp-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Current Role</th>
                  <th>Modify Role (Admin action)</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td className="font-semibold">{emp.name}</td>
                    <td className="tech-code">{emp.email}</td>
                    <td className="text-xs">{emp.department?.name || "Unassigned"}</td>
                    <td>
                      <span className={`badge ${emp.role === "Admin" ? "badge-danger" : emp.role === "AssetManager" ? "badge-warning" : "badge-success"}`}>
                        {emp.role}
                      </span>
                    </td>
                    <td>
                      <select
                        value={emp.role}
                        onChange={(e) => handlePromoteRole(emp.id, e.target.value)}
                        className="erp-input text-xs py-1"
                      >
                        <option value="Employee">Employee</option>
                        <option value="DeptHead">Dept Head</option>
                        <option value="AssetManager">Asset Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
