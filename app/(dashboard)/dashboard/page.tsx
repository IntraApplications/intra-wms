"use client";
import React from "react";

export default function DashboardPage() {
  return (
    <div className="flex h-screen bg-primary text-white">
      {/* Sidebar */}
      <aside className="w-48 bg-secondary border-r border-border p-4 flex flex-col pt-16">
        <nav className="flex flex-col space-y-2 mt-10">
          <a
            href="#"
            className="text-xs font-bold hover:bg-tertiary p-2 rounded"
          >
            Home
          </a>
          <a
            href="#"
            className="text-xs font-bold hover:bg-tertiary p-2 rounded"
          >
            Employees
          </a>
          <a
            href="#"
            className="text-xs font-bold hover:bg-tertiary p-2 rounded"
          >
            Onboarding
          </a>
          <a
            href="#"
            className="text-xs font-bold hover:bg-tertiary p-2 rounded"
          >
            Digital Marketplace
          </a>
          <a
            href="#"
            className="text-xs font-bold hover:bg-tertiary p-2 rounded"
          >
            Virtual Workspaces
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-grow overflow-y-auto">
        {/* Top Navbar */}
        <header className="bg-secondary p-4 border-b border-border flex justify-between items-center fixed top-0 left-0 right-0 z-10">
          <div className="text-lg font-semibold">Intra</div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search applications"
              className="p-2 rounded bg-gray-700 text-white"
            />
            <button className="p-2 bg-gray-700 rounded">🔍</button>
            <button className="p-2 bg-gray-700 rounded">⚙️</button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 flex-grow pt-16 mt-10">
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-1 bg-secondary p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Primary Text</h2>
              <div className="text-3xl font-bold mb-4">5,987.34</div>
              <div className="mb-4">
                <p>Foo: 3,456</p>
                <p>Bar: 2,321</p>
              </div>
              <div className="h-40 bg-gray-700 rounded mt-4 flex items-center justify-center">
                <span>Pie Chart</span>
              </div>
            </div>
            <div className="col-span-2 bg-secondary p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Bot Statistics</h2>
              <div className="flex flex-wrap gap-4">
                <div className="flex-grow bg-gray-700 h-40 rounded flex items-center justify-center">
                  <span>Graph 1</span>
                </div>
                <div className="flex-grow bg-gray-700 h-40 rounded flex items-center justify-center">
                  <span>Graph 2</span>
                </div>
              </div>
              <table className="w-full text-left mt-6">
                <thead>
                  <tr>
                    <th className="py-2">Customer</th>
                    <th className="py-2">Bot Type</th>
                    <th className="py-2">Level</th>
                    <th className="py-2">Number of Requests</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Customer</td>
                    <td className="py-2">StormBot sneaker bot</td>
                    <td className="py-2 text-red-500">Critical</td>
                    <td className="py-2">227,531</td>
                  </tr>
                  <tr>
                    <td className="py-2">Customer</td>
                    <td className="py-2">Unknown user-agent</td>
                    <td className="py-2 text-red-500">Critical</td>
                    <td className="py-2">59,820</td>
                  </tr>
                  <tr>
                    <td className="py-2">Customer</td>
                    <td className="py-2">BOT_234.40349432</td>
                    <td className="py-2 text-red-500">Critical</td>
                    <td className="py-2">77,742</td>
                  </tr>
                  <tr>
                    <td className="py-2">Customer</td>
                    <td className="py-2">TEKO ticket bot</td>
                    <td className="py-2 text-red-500">Critical</td>
                    <td className="py-2">501,995</td>
                  </tr>
                  <tr>
                    <td className="py-2">Customer</td>
                    <td className="py-2">Google crawler</td>
                    <td className="py-2 text-green-500">Safe</td>
                    <td className="py-2">227</td>
                  </tr>
                  <tr>
                    <td className="py-2">Customer</td>
                    <td className="py-2">Search bot</td>
                    <td className="py-2 text-yellow-500">Needs Attention</td>
                    <td className="py-2">843</td>
                  </tr>
                  <tr>
                    <td className="py-2">Customer</td>
                    <td className="py-2">BOT_REQUEST_LIB_GOLANG</td>
                    <td className="py-2 text-red-500">Critical</td>
                    <td className="py-2">23,411</td>
                  </tr>
                  <tr>
                    <td className="py-2">Customer</td>
                    <td className="py-2">Unknown sneaker bot BF5</td>
                    <td className="py-2 text-red-500">Critical</td>
                    <td className="py-2">743,489</td>
                  </tr>
                  <tr>
                    <td className="py-2">Customer</td>
                    <td className="py-2">Unknown spam bot AF0042</td>
                    <td className="py-2 text-red-500">Critical</td>
                    <td className="py-2"></td>
                  </tr>
                  <tr>
                    <td className="py-2">Customer</td>
                    <td className="py-2">Unknown spam bot KPJ505</td>
                    <td className="py-2 text-red-500">Critical</td>
                    <td className="py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
